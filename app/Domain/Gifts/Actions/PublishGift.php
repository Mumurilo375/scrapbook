<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PublishGift
{
    public function __construct(
        private readonly GiftPublicationChecklist $checklist,
        private readonly AnalyticsTracker $tracker,
    ) {}

    public function handle(User $user, Gift $gift, bool $paymentApproved = false): Gift
    {
        Gate::forUser($user)->authorize('view', $gift);

        if (! $paymentApproved) {
            throw ValidationException::withMessages([
                'payment' => 'A publicação pública agora exige pagamento aprovado.',
            ]);
        }

        if ($gift->statusEnum() === GiftStatus::Published) {
            return $gift->refresh();
        }

        $checks = $this->checklist->evaluate($user, $gift, allowPendingPayment: true);

        if (! $this->checklist->canPublish($checks)) {
            throw ValidationException::withMessages([
                'publication' => 'Este gift ainda não pode ser publicado.',
                ...$this->checklist->errorMessages($checks),
            ]);
        }

        /** @var Plan|null $plan */
        $plan = $gift->plan()->first();
        $giftLifetimeDays = $this->giftLifetimeDays($gift, $plan);

        $gift->forceFill([
            'slug' => $this->publicSlug($gift),
            'public_code' => $this->safePublicCode($gift->public_code) ? $gift->public_code : $this->generatePublicCode(),
            'status' => GiftStatus::Published,
            'visibility' => GiftVisibility::PublicLink,
            'published_at' => now(),
            'expires_at' => now()->addDays($giftLifetimeDays),
        ])->save();

        $this->tracker->track(AnalyticsEventName::GiftPublished, [
            'source' => 'server',
            'user' => $user,
            'gift' => $gift->refresh(),
        ], [
            'gift_lifetime_days' => $giftLifetimeDays,
        ]);

        return $gift->refresh();
    }

    private function generatePublicCode(): string
    {
        do {
            $publicCode = Str::random(32);
        } while (Gift::query()->where('public_code', $publicCode)->exists());

        return $publicCode;
    }

    private function publicSlug(Gift $gift): string
    {
        if (is_string($gift->slug) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $gift->slug) === 1) {
            return $gift->slug;
        }

        $slug = Str::slug((string) $gift->title);

        if ($slug === '') {
            return 'presente-digital';
        }

        return trim(Str::limit($slug, 90, ''), '-') ?: 'presente-digital';
    }

    private function safePublicCode(mixed $publicCode): bool
    {
        return is_string($publicCode) && preg_match('/^[A-Za-z0-9]{16,64}$/', $publicCode) === 1;
    }

    private function giftLifetimeDays(Gift $gift, ?Plan $plan): int
    {
        $snapshotLifetimeDays = data_get($gift->limits_snapshot, 'gift_lifetime_days');

        if (is_numeric($snapshotLifetimeDays) && (int) $snapshotLifetimeDays > 0) {
            return (int) $snapshotLifetimeDays;
        }

        if ($plan instanceof Plan && is_int($plan->gift_lifetime_days) && $plan->gift_lifetime_days > 0) {
            return $plan->gift_lifetime_days;
        }

        return max(1, (int) config('scrapbook.gifts.default_lifetime_days', 180));
    }
}
