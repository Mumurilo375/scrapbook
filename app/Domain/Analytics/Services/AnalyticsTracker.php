<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Analytics\Support\AnalyticsPayloadSanitizer;
use App\Domain\Analytics\Support\AnalyticsRequestContext;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\Theme;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class AnalyticsTracker
{
    public function __construct(
        private AnalyticsSessionResolver $sessionResolver,
        private AnalyticsPayloadSanitizer $sanitizer,
        private AnalyticsRequestContext $requestContext,
    ) {}

    /**
     * @param  array<string, mixed>  $context
     * @param  array<string, mixed>  $payload
     */
    public function track(string|AnalyticsEventName $event, array $context = [], array $payload = []): ?AnalyticsEvent
    {
        if (! (bool) config('scrapbook.analytics.enabled', true)) {
            return null;
        }

        try {
            $eventName = $event instanceof AnalyticsEventName ? $event : AnalyticsEventName::tryFrom($event);

            if (! $eventName instanceof AnalyticsEventName) {
                Log::warning('Ignoring unknown analytics event.', ['event' => $event]);

                return null;
            }

            return $this->trackResolved($eventName, $context, $payload);
        } catch (Throwable $exception) {
            report($exception);
            Log::warning('Analytics tracking failed.', [
                'event' => $event instanceof BackedEnum ? $event->value : $event,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array<string, mixed>  $payload
     */
    private function trackResolved(AnalyticsEventName $eventName, array $context, array $payload): ?AnalyticsEvent
    {
        $request = $context['request'] ?? request();
        $request = $request instanceof Request ? $request : null;
        $session = $this->analyticsSession($context, $request);
        $giftVisit = $context['gift_visit'] ?? null;
        $giftVisit = $giftVisit instanceof GiftVisit ? $giftVisit : null;
        $gift = $this->model($context['gift'] ?? null, Gift::class) ?? $giftVisit?->gift;
        $order = $this->model($context['order'] ?? null, Order::class);
        $payment = $this->model($context['payment'] ?? null, Payment::class);
        $plan = $this->model($context['plan'] ?? null, Plan::class) ?? $order?->plan ?? $gift?->plan;
        $template = $this->model($context['template'] ?? null, Template::class);
        $templateVersion = $this->model($context['template_version'] ?? null, TemplateVersion::class) ?? $gift?->templateVersion;
        $theme = $this->model($context['theme'] ?? null, Theme::class);
        $themeVersion = $this->model($context['theme_version'] ?? null, ThemeVersion::class) ?? $gift?->themeVersion;
        $occasion = $this->model($context['occasion'] ?? null, Occasion::class) ?? $gift?->occasion;
        $user = $this->model($context['user'] ?? null, User::class) ?? $request?->user() ?? $gift?->user ?? $order?->user;
        $eventUuid = $this->nullableString($context['event_uuid'] ?? null);

        if ($session instanceof AnalyticsSession && $user instanceof User && $session->user_id !== $user->id) {
            $session->forceFill(['user_id' => $user->id])->save();
        }

        if ($eventUuid !== null) {
            $existing = AnalyticsEvent::query()->where('event_uuid', $eventUuid)->first();

            if ($existing instanceof AnalyticsEvent) {
                return $existing;
            }
        }

        $occurredAt = $context['occurred_at'] ?? now();
        $metadata = is_array($context['metadata'] ?? null) ? $context['metadata'] : [];
        $source = $this->nullableString($context['source'] ?? null)
            ?? ($request?->is('admin*') ? 'admin' : 'server');

        $analyticsEvent = AnalyticsEvent::query()->create([
            'event_uuid' => $eventUuid,
            'session_id' => $session?->id,
            'user_id' => $user?->id,
            'gift_id' => $gift?->id,
            'order_id' => $order?->id,
            'payment_id' => $payment?->id,
            'plan_id' => $plan?->id,
            'template_id' => $template?->id ?? $templateVersion?->template_id,
            'template_version_id' => $templateVersion?->id,
            'theme_id' => $theme?->id ?? $themeVersion?->theme_id,
            'theme_version_id' => $themeVersion?->id,
            'occasion_id' => $occasion?->id,
            'event_name' => $eventName->value,
            'event_group' => $eventName->group()->value,
            'occurred_at' => $occurredAt,
            'source' => $source,
            'path' => $this->nullableString($context['path'] ?? null) ?? ($request ? $this->requestContext->path($request) : null),
            'referrer' => $this->nullableString($context['referrer'] ?? null) ?? ($request ? $this->requestContext->referrer($request) : null),
            'payload' => $this->sanitizer->sanitize($payload),
            'metadata' => $this->sanitizer->sanitize($metadata),
        ]);

        if ($gift instanceof Gift && ($giftVisit instanceof GiftVisit || $eventName->shouldCreateGiftEvent())) {
            $this->trackGiftEvent($eventName, $analyticsEvent, $gift, $giftVisit, $session, $context, $payload, $metadata);
        }

        return $analyticsEvent;
    }

    /**
     * @param  array<string, mixed>  $context
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $metadata
     */
    private function trackGiftEvent(
        AnalyticsEventName $eventName,
        AnalyticsEvent $analyticsEvent,
        Gift $gift,
        ?GiftVisit $giftVisit,
        ?AnalyticsSession $session,
        array $context,
        array $payload,
        array $metadata,
    ): void {
        $pageIndex = $this->nullableInt($context['page_index'] ?? $payload['page_index'] ?? null);
        $pageId = $this->nullableString($context['page_id'] ?? $payload['page_id'] ?? null);

        if ($eventName === AnalyticsEventName::GiftPageViewed
            && $giftVisit instanceof GiftVisit
            && $this->giftPageWasAlreadyViewed($giftVisit, $pageIndex, $pageId)) {
            return;
        }

        GiftEvent::query()->create([
            'gift_id' => $gift->id,
            'gift_visit_id' => $giftVisit?->id,
            'analytics_session_id' => $session?->id,
            'user_id' => $analyticsEvent->user_id,
            'event_name' => $eventName->value,
            'event_type' => $eventName->value,
            'page_index' => $pageIndex,
            'page_id' => $pageId,
            'element_id' => $this->nullableString($context['element_id'] ?? $payload['element_id'] ?? null),
            'element_type' => $this->nullableString($context['element_type'] ?? $payload['element_type'] ?? null),
            'payload' => $this->sanitizer->sanitize($payload),
            'metadata' => $this->sanitizer->sanitize($metadata),
            'occurred_at' => $analyticsEvent->occurred_at,
        ]);

        if ($giftVisit instanceof GiftVisit) {
            $updates = [];

            if ($eventName === AnalyticsEventName::GiftPageViewed) {
                $updates['page_views_count'] = $giftVisit->page_views_count + 1;
            }

            if ($eventName->incrementsGiftVisitInteractions()) {
                $updates['interactions_count'] = $giftVisit->interactions_count + 1;
            }

            if (in_array($eventName, [AnalyticsEventName::GiftCompleted, AnalyticsEventName::GiftOpeningCompleted], true)
                && $giftVisit->completed_at === null) {
                $updates['completed_at'] = now();
            }

            if ($updates !== []) {
                $giftVisit->forceFill($updates)->save();
            }
        }
    }

    private function giftPageWasAlreadyViewed(GiftVisit $giftVisit, ?int $pageIndex, ?string $pageId): bool
    {
        return GiftEvent::query()
            ->where('gift_visit_id', $giftVisit->id)
            ->where('event_name', AnalyticsEventName::GiftPageViewed->value)
            ->when($pageId !== null, fn ($query) => $query->where('page_id', $pageId))
            ->when($pageId === null && $pageIndex !== null, fn ($query) => $query->where('page_index', $pageIndex))
            ->exists();
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function analyticsSession(array $context, ?Request $request): ?AnalyticsSession
    {
        $session = $context['analytics_session'] ?? null;

        if ($session instanceof AnalyticsSession) {
            return $session;
        }

        return $request instanceof Request ? $this->sessionResolver->resolve($request) : null;
    }

    /**
     * @template T of object
     *
     * @param  class-string<T>  $class
     * @return T|null
     */
    private function model(mixed $value, string $class): ?object
    {
        return $value instanceof $class ? $value : null;
    }

    private function nullableString(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }

    private function nullableInt(mixed $value): ?int
    {
        return is_numeric($value) ? max(0, (int) $value) : null;
    }
}
