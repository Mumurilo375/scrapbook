<?php

namespace App\Http\Controllers\Payments;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Domain\Payments\Actions\CreateCheckoutOrder;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftCheckoutController extends Controller
{
    public function show(Request $request, Gift $gift, GiftPublicationChecklist $checklist): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $gift->load(['pages', 'mediaItems', 'plan']);

        $plan = $this->resolvePlan($gift);
        $checks = $checklist->evaluate(
            $request->user(),
            $gift,
            allowPublished: $gift->statusEnum() === GiftStatus::Published,
            allowPendingPayment: $gift->statusEnum() === GiftStatus::PendingPayment,
        );

        return Inertia::render('payments/Checkout/CheckoutShow', [
            'gift' => $this->giftPayload($gift),
            'plan' => $plan instanceof Plan ? $this->planPayload($plan) : null,
            'order' => $this->orderPayload($this->latestRelevantOrder($request->user()->id, $gift)),
            'checks' => $checks,
            'can_checkout' => $gift->statusEnum() === GiftStatus::Draft
                && $plan instanceof Plan
                && $checklist->canPublish($checks),
            'urls' => [
                'store' => route('app.gifts.checkout.store', $gift, false),
            ],
            'dev_mode' => $this->devPaymentApprovalEnabled(),
        ]);
    }

    public function store(Request $request, Gift $gift, CreateCheckoutOrder $createCheckoutOrder): RedirectResponse
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $plan = $this->resolvePlan($gift);

        abort_if(! ($plan instanceof Plan), 422, 'Nenhum plano ativo está disponível para checkout.');

        $order = $createCheckoutOrder->handle($request->user(), $gift, $plan);

        return redirect()
            ->route('app.orders.show', $order)
            ->with('status', 'Pedido criado. O pagamento está pendente.');
    }

    private function resolvePlan(Gift $gift): ?Plan
    {
        if ($gift->plan instanceof Plan && $gift->plan->is_active) {
            return $gift->plan;
        }

        return Plan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price_cents')
            ->first();
    }

    private function latestRelevantOrder(int $userId, Gift $gift): ?Order
    {
        return Order::query()
            ->with(['plan', 'payments'])
            ->where('user_id', $userId)
            ->where('gift_id', $gift->id)
            ->whereIn('status', [OrderStatus::Pending->value, OrderStatus::Paid->value])
            ->latest('updated_at')
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function giftPayload(Gift $gift): array
    {
        $visiblePagesCount = $gift->pages
            ->filter(fn (GiftPage $page): bool => $page->is_visible)
            ->count();

        return [
            'id' => $gift->id,
            'title' => $gift->title,
            'status' => $this->enumValue($gift->status),
            'recipient_name' => $gift->recipient_name,
            'sender_name' => $gift->sender_name,
            'page_count' => $gift->pages->count(),
            'visible_page_count' => $visiblePagesCount,
            'media_count' => $gift->mediaItems->count(),
            'urls' => [
                'dashboard' => route('app.gifts.index', [], false),
                'edit' => route('app.gifts.edit', $gift, false),
                'preview' => route('app.gifts.preview', $gift, false),
                'review' => route('app.gifts.review', $gift, false),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function planPayload(Plan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'description' => $plan->description,
            'price_cents' => $plan->price_cents,
            'currency' => $plan->currency,
            'max_pages' => $plan->max_pages,
            'max_photos' => $plan->max_photos,
            'gift_lifetime_days' => $plan->gift_lifetime_days,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function orderPayload(?Order $order): ?array
    {
        if (! $order instanceof Order) {
            return null;
        }

        $approvedPayment = $order->payments
            ->first(fn (Payment $payment): bool => $this->enumValue($payment->status) === 'approved');

        return [
            'id' => $order->id,
            'status' => $this->enumValue($order->status),
            'amount_cents' => $order->amount_cents,
            'currency' => $order->currency,
            'provider' => $order->provider,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'expires_at' => $order->expires_at?->toIso8601String(),
            'payment_status' => $approvedPayment instanceof Payment ? 'approved' : 'pending',
            'url' => route('app.orders.show', $order, false),
        ];
    }

    private function devPaymentApprovalEnabled(): bool
    {
        return ! app()->environment('production')
            && (bool) config('scrapbook.payments.dev_approval_enabled', true);
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
