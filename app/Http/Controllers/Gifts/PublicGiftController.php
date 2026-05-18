<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Analytics\Models\GiftVisit;
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
    public function __invoke(Request $request, string $slugToken, PublicGiftResolver $publicGiftResolver): Response|SymfonyResponse
    {
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

        $this->recordVisit($request, $gift);

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

    private function recordVisit(Request $request, Gift $gift): void
    {
        try {
            GiftVisit::query()->create([
                'gift_id' => $gift->id,
                'session_hash' => $this->hashNullable($request->session()->getId()),
                'ip_hash' => $this->hashNullable($request->ip()),
                'user_agent_hash' => $this->hashNullable($request->userAgent()),
                'referrer' => $this->referrerHost($request),
                'opened_at' => now(),
                'metadata' => [
                    'source' => 'public_viewer',
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);
        }
    }

    private function hashNullable(?string $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return hash('sha256', config('app.key').'|viewer|'.$value);
    }

    private function referrerHost(Request $request): ?string
    {
        $referrer = $request->headers->get('referer');

        if (! is_string($referrer) || $referrer === '') {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        return is_string($host) && $host !== '' ? Str::limit($host, 255, '') : null;
    }
}
