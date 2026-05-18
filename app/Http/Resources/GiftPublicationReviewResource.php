<?php

namespace App\Http\Resources;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Gift
 */
class GiftPublicationReviewResource extends JsonResource
{
    /**
     * @param  array<int, array{key: string, label: string, passed: bool, severity: string, message?: string}>  $checks
     */
    public function __construct(
        Gift $resource,
        private readonly array $checks,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $visiblePagesCount = $this->pages
            ->filter(fn (GiftPage $page): bool => $page->is_visible)
            ->count();
        $publicUrl = $this->publicUrl();
        $latestOrder = $this->latestRelevantOrder($request);
        $canPublish = $this->statusEnum() === GiftStatus::Draft
            && app(GiftPublicationChecklist::class)->canPublish($this->checks);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->enumValue($this->status),
            'recipient_name' => $this->recipient_name,
            'sender_name' => $this->sender_name,
            'published_at' => $this->published_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'page_count' => $this->pages->count(),
            'visible_page_count' => $visiblePagesCount,
            'media_count' => $this->mediaItems->count(),
            'can_publish' => false,
            'can_checkout' => $canPublish,
            'checks' => $this->checks,
            'order' => $latestOrder instanceof Order ? [
                'id' => $latestOrder->id,
                'status' => $this->enumValue($latestOrder->status),
                'amount_cents' => $latestOrder->amount_cents,
                'currency' => $latestOrder->currency,
                'url' => route('app.orders.show', $latestOrder, false),
            ] : null,
            'public_url' => $publicUrl,
            'urls' => [
                'dashboard' => route('app.gifts.index', [], false),
                'edit' => route('app.gifts.edit', $this->resource, false),
                'preview' => route('app.gifts.preview', $this->resource, false),
                'checkout' => route('app.gifts.checkout', $this->resource, false),
                'publish' => route('app.gifts.publish', $this->resource, false),
                'public' => $publicUrl,
            ],
        ];
    }

    private function publicUrl(): ?string
    {
        if (! $this->resource->isPubliclyAccessible()) {
            return null;
        }

        $slugToken = app(PublicGiftResolver::class)->slugToken($this->resource);

        return $slugToken === null ? null : route('public.gifts.show', $slugToken);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }

    private function latestRelevantOrder(Request $request): ?Order
    {
        return Order::query()
            ->where('user_id', $request->user()->id)
            ->where('gift_id', $this->resource->id)
            ->whereIn('status', [OrderStatus::Pending->value, OrderStatus::Paid->value])
            ->latest('updated_at')
            ->first();
    }

    private function statusEnum(): GiftStatus
    {
        $status = $this->status;

        return $status instanceof GiftStatus ? $status : GiftStatus::from((string) $status);
    }
}
