<?php

namespace App\Http\Controllers\Payments;

use App\Domain\Gifts\Services\PublicGiftResolver;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Http\Controllers\Controller;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OrderStatusController extends Controller
{
    public function __construct(private readonly PublicGiftResolver $publicGiftResolver) {}

    public function __invoke(Request $request, Order $order): Response
    {
        Gate::forUser($request->user())->authorize('view', $order);

        $order->load(['gift', 'plan', 'payments']);

        return Inertia::render('payments/Orders/OrderShow', [
            'order' => $this->orderPayload($order),
            'dev_approval_enabled' => $this->devPaymentApprovalEnabled(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function orderPayload(Order $order): array
    {
        $gift = $order->gift;
        $plan = $order->plan;
        $latestPayment = $order->payments->sortByDesc('created_at')->first();
        $approvedPayment = $order->payments
            ->first(fn (Payment $payment): bool => $payment->status === PaymentStatus::Approved);
        $publicUrl = null;

        if ($gift !== null && $gift->isPubliclyAccessible()) {
            $slugToken = $this->publicGiftResolver->slugToken($gift);
            $publicUrl = $slugToken === null ? null : route('public.gifts.show', $slugToken);
        }

        return [
            'id' => $order->id,
            'status' => $this->enumValue($order->status),
            'amount_cents' => $order->amount_cents,
            'currency' => $order->currency,
            'provider' => $order->provider,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'expires_at' => $order->expires_at?->toIso8601String(),
            'payment_status' => $approvedPayment instanceof Payment
                ? $this->enumValue($approvedPayment->status)
                : ($latestPayment instanceof Payment ? $this->enumValue($latestPayment->status) : 'pending'),
            'payment_processed_at' => $approvedPayment?->processed_at?->toIso8601String(),
            'gift' => $gift === null ? null : [
                'id' => $gift->id,
                'title' => $gift->title,
                'status' => $this->enumValue($gift->status),
                'public_url' => $publicUrl,
                'urls' => [
                    'dashboard' => route('app.gifts.index', [], false),
                    'edit' => route('app.gifts.edit', $gift, false),
                    'preview' => route('app.gifts.preview', $gift, false),
                    'review' => route('app.gifts.review', $gift, false),
                    'checkout' => route('app.gifts.checkout', $gift, false),
                    'public' => $publicUrl,
                    'share' => $publicUrl !== null ? route('app.gifts.share', $gift, false) : null,
                    'qr_code' => $publicUrl !== null ? route('app.gifts.qr-code', $gift, false) : null,
                    'qr_code_download' => $publicUrl !== null ? route('app.gifts.qr-code', $gift, false).'?download=1' : null,
                    'share_card' => $publicUrl !== null ? route('app.gifts.share-card', $gift, false) : null,
                ],
            ],
            'plan' => $plan === null ? null : [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_cents' => $plan->price_cents,
                'currency' => $plan->currency,
                'gift_lifetime_days' => $plan->gift_lifetime_days,
            ],
            'urls' => [
                'self' => route('app.orders.show', $order, false),
                'dev_approve' => route('app.orders.dev-approve', $order, false),
            ],
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
