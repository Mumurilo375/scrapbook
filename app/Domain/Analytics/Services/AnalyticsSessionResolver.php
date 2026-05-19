<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Support\AnalyticsIdentityHasher;
use App\Domain\Analytics\Support\AnalyticsRequestContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Throwable;

final readonly class AnalyticsSessionResolver
{
    public const COOKIE_NAME = 'scrapbook_visitor';

    public function __construct(
        private AnalyticsIdentityHasher $hasher,
        private AnalyticsRequestContext $requestContext,
    ) {}

    public function resolve(Request $request): ?AnalyticsSession
    {
        if (! (bool) config('scrapbook.analytics.enabled', true)) {
            return null;
        }

        $existing = $request->attributes->get('analytics_session');

        if ($existing instanceof AnalyticsSession) {
            return $existing;
        }

        try {
            $sessionUuid = $this->sessionUuid($request);
            $now = now();
            $summary = $this->requestContext->userAgentSummary($request->userAgent());

            if ($request->hasSession()) {
                $request->session()->put('analytics.session_uuid', $sessionUuid);
            }

            $session = AnalyticsSession::query()->firstOrNew([
                'session_uuid' => $sessionUuid,
            ]);

            $isNew = ! $session->exists;
            $metadata = is_array($session->metadata) ? $session->metadata : [];

            $session->fill([
                'user_id' => $request->user()?->getAuthIdentifier() ?? $session->user_id,
                'first_seen_at' => $session->first_seen_at ?? $now,
                'last_seen_at' => $now,
                'entry_path' => $session->entry_path ?? $this->requestContext->path($request),
                'current_path' => $this->requestContext->path($request),
                'referrer' => $session->referrer ?? $this->requestContext->referrer($request),
                'utm_source' => $session->utm_source ?? $this->utm($request, 'utm_source'),
                'utm_medium' => $session->utm_medium ?? $this->utm($request, 'utm_medium'),
                'utm_campaign' => $session->utm_campaign ?? $this->utm($request, 'utm_campaign'),
                'utm_content' => $session->utm_content ?? $this->utm($request, 'utm_content'),
                'utm_term' => $session->utm_term ?? $this->utm($request, 'utm_term'),
                'device_type' => $summary['device_type'],
                'browser' => $summary['browser'],
                'os' => $summary['os'],
                'locale' => $session->locale ?? $this->requestContext->locale($request),
                'ip_hash' => $this->hasher->hash($request->ip(), 'ip'),
                'user_agent_hash' => $this->hasher->hash($request->userAgent(), 'user_agent'),
                'metadata' => [
                    ...$metadata,
                    'schemaVersion' => 1,
                    'created_from_cookie' => ! $isNew,
                ],
            ]);

            $session->save();
            $request->attributes->set('analytics_session', $session);

            return $session;
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }

    private function sessionUuid(Request $request): string
    {
        $cookieValue = $request->cookies->get(self::COOKIE_NAME);
        $sessionUuid = is_string($cookieValue) && Str::isUuid($cookieValue) ? $cookieValue : (string) Str::uuid();

        if ($cookieValue !== $sessionUuid) {
            Cookie::queue(cookie(
                self::COOKIE_NAME,
                $sessionUuid,
                (int) config('scrapbook.analytics.cookie_minutes', 60 * 24 * 365),
                sameSite: 'lax',
            ));
        }

        return $sessionUuid;
    }

    private function utm(Request $request, string $key): ?string
    {
        $value = $request->query($key);

        return is_string($value) && trim($value) !== '' ? Str::limit(trim($value), 255, '') : null;
    }
}
