<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftShareCardData;
use App\Domain\Gifts\Services\GiftShareUrlGenerator;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftShareController extends Controller
{
    public function __construct(
        private readonly GiftShareUrlGenerator $urlGenerator,
        private readonly GiftShareCardData $shareCardData,
    ) {}

    public function __invoke(Request $request, Gift $gift): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $gift->loadMissing('themeVersion.theme');

        $publicUrl = $this->urlGenerator->publicUrl($gift);
        $canShare = $publicUrl !== null;

        return Inertia::render('gifts/Share/GiftShare', [
            'gift' => $this->giftPayload($gift),
            'share' => [
                'can_share' => $canShare,
                'status_message' => $canShare ? null : $this->unavailableMessage($gift),
                'public_url' => $publicUrl,
                'qr_code_url' => $canShare ? route('app.gifts.qr-code', $gift, false) : null,
                'qr_code_download_url' => $canShare ? route('app.gifts.qr-code', $gift, false).'?download=1' : null,
                'card_url' => $canShare ? route('app.gifts.share-card', $gift, false) : null,
                'card_download_url' => $canShare ? route('app.gifts.share-card.download', $gift, false) : null,
                'card' => $canShare ? $this->shareCardData->forGift($gift) : null,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function giftPayload(Gift $gift): array
    {
        return [
            'id' => $gift->id,
            'title' => $gift->title,
            'status' => $this->enumValue($gift->status),
            'recipient_name' => $gift->recipient_name,
            'sender_name' => $gift->sender_name,
            'published_at' => $gift->published_at?->toIso8601String(),
            'expires_at' => $gift->expires_at?->toIso8601String(),
            'urls' => [
                'dashboard' => route('app.gifts.index', [], false),
                'edit' => route('app.gifts.edit', $gift, false),
                'preview' => route('app.gifts.preview', $gift, false),
                'review' => route('app.gifts.review', $gift, false),
            ],
        ];
    }

    private function unavailableMessage(Gift $gift): string
    {
        if ($gift->expires_at?->isPast()) {
            return 'Este presente expirou e não pode gerar QR Code ativo.';
        }

        return match ($this->enumValue($gift->status)) {
            'draft', 'pending_payment' => 'Publique o presente para gerar QR Code.',
            'disabled' => 'Este presente está desativado e não pode gerar QR Code ativo.',
            'expired' => 'Este presente expirou e não pode gerar QR Code ativo.',
            default => 'Este presente ainda não tem um link público ativo.',
        };
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
