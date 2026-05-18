<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserGiftDashboardController extends Controller
{
    public function __construct(private readonly PublicGiftResolver $publicGiftResolver) {}

    public function __invoke(Request $request): Response
    {
        $gifts = Gift::query()
            ->where('user_id', $request->user()->id)
            ->with(['occasion', 'templateVersion.template', 'orders' => fn ($query) => $query
                ->whereIn('status', [OrderStatus::Pending->value, OrderStatus::Paid->value])
                ->latest('updated_at')])
            ->orderByDesc('last_edited_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Gift $gift): array => $this->giftPayload($gift))
            ->values();

        return Inertia::render('gifts/Dashboard/GiftIndex', [
            'gifts' => $gifts,
            'createUrl' => route('create.index'),
        ]);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function giftPayload(Gift $gift): array
    {
        $slugToken = $this->publicGiftResolver->slugToken($gift);
        $publicUrl = $slugToken !== null && $gift->isPubliclyAccessible()
            ? route('public.gifts.show', $slugToken)
            : null;

        return [
            'id' => $gift->id,
            'title' => $gift->title,
            'status' => $this->enumValue($gift->status),
            'updated_at' => $gift->updated_at?->toIso8601String(),
            'last_edited_at' => $gift->last_edited_at?->toIso8601String(),
            'published_at' => $gift->published_at?->toIso8601String(),
            'expires_at' => $gift->expires_at?->toIso8601String(),
            'occasion' => $gift->occasion ? [
                'name' => $gift->occasion->name,
                'slug' => $gift->occasion->slug,
            ] : null,
            'template' => $gift->templateVersion?->template ? [
                'name' => $gift->templateVersion->template->name,
                'slug' => $gift->templateVersion->template->slug,
            ] : null,
            'edit_url' => route('app.gifts.edit', $gift),
            'preview_url' => route('app.gifts.preview', $gift),
            'review_url' => route('app.gifts.review', $gift),
            'checkout_url' => route('app.gifts.checkout', $gift),
            'order_url' => $this->latestOrderUrl($gift),
            'public_url' => $publicUrl,
        ];
    }

    private function latestOrderUrl(Gift $gift): ?string
    {
        $order = $gift->orders->first();

        return $order instanceof Order ? route('app.orders.show', $order) : null;
    }
}
