<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Analytics\Services\AnalyticsSessionResolver;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Analytics\Support\AnalyticsIdentityHasher;
use App\Domain\Analytics\Support\AnalyticsRequestContext;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Http\Controllers\Controller;
use App\Http\Resources\GiftViewerResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Throwable;

class PublicGiftController extends Controller
{
    public function __invoke(
        Request $request,
        string $slugToken,
        PublicGiftResolver $publicGiftResolver,
        AnalyticsSessionResolver $sessionResolver,
        AnalyticsIdentityHasher $hasher,
        AnalyticsRequestContext $requestContext,
        AnalyticsTracker $tracker,
    ): Response|SymfonyResponse {
        $gift = $publicGiftResolver->resolve($slugToken);

        if (! $gift instanceof Gift) {
            return $this->unavailableResponse($request);
        }

        $gift->load([
            'themeVersion.theme',
            'pages' => fn ($query) => $query
                ->where('is_visible', true)
                ->orderBy('sort_order'),
            'mediaItems' => fn ($query) => $query
                ->where('type', MediaType::Image->value)
                ->where('status', MediaStatus::Processed->value),
        ]);

        $visit = $this->recordVisit($request, $gift, $sessionResolver, $hasher, $requestContext);

        if ($visit instanceof GiftVisit) {
            $request->attributes->set('public_gift_visit', $visit);
        }

        $tracker->track(AnalyticsEventName::PublicGiftOpened, [
            'request' => $request,
            'source' => 'viewer',
            'gift' => $gift,
            'gift_visit' => $visit,
            'analytics_session' => $visit?->analyticsSession,
            'metadata' => [
                'public_source' => $visit?->public_source,
            ],
        ], [
            'pages_count' => $gift->pages->count(),
            'public_source' => $visit?->public_source,
        ]);

        return Inertia::render('public-gifts/PublicGiftShow', [
            'gift' => (new GiftViewerResource($gift, ViewerMediaUrlResolver::CONTEXT_PUBLIC))->resolve($request),
        ]);
    }

    private function unavailableResponse(Request $request): SymfonyResponse
    {
        return Inertia::render('public-gifts/PublicGiftUnavailable', [
            'createUrl' => route('create.index', [], false),
        ])->toResponse($request)->setStatusCode(404);
    }

    private function recordVisit(
        Request $request,
        Gift $gift,
        AnalyticsSessionResolver $sessionResolver,
        AnalyticsIdentityHasher $hasher,
        AnalyticsRequestContext $requestContext,
    ): ?GiftVisit {
        try {
            $analyticsSession = $sessionResolver->resolve($request);
            $summary = $requestContext->userAgentSummary($request->userAgent());

            return GiftVisit::query()->create([
                'gift_id' => $gift->id,
                'visit_uuid' => (string) Str::uuid(),
                'analytics_session_id' => $analyticsSession?->id,
                'public_source' => $requestContext->publicSource($request),
                'session_hash' => $hasher->hash($request->session()->getId(), 'laravel_session'),
                'ip_hash' => $hasher->hash($request->ip(), 'ip'),
                'user_agent_hash' => $hasher->hash($request->userAgent(), 'user_agent'),
                'device_type' => $summary['device_type'],
                'browser' => $summary['browser'],
                'os' => $summary['os'],
                'referrer' => $requestContext->referrerHost($request),
                'opened_at' => now(),
                'metadata' => [
                    'schemaVersion' => 1,
                    'source' => 'public_viewer',
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return null;
        }
    }
}
