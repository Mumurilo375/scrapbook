<?php

namespace App\Domain\Payments\Actions;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Actions\PublishGift;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ProcessApprovedPayment
{
    public function __construct(
        private readonly PublishGift $publishGift,
        private readonly AnalyticsTracker $tracker,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handle(Order $order, array $payload = []): Payment
    {
        return DB::transaction(function () use ($order, $payload): Payment {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->with(['gift', 'user', 'payments'])
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            $approvedPayment = $lockedOrder->payments
                ->first(fn (Payment $payment): bool => $payment->status === PaymentStatus::Approved);
            $paymentWasAlreadyApproved = $approvedPayment instanceof Payment;
            $orderWasAlreadyPaid = $lockedOrder->status === OrderStatus::Paid;

            if (in_array($lockedOrder->status, [OrderStatus::Canceled, OrderStatus::Expired, OrderStatus::Refunded], true)) {
                throw ValidationException::withMessages([
                    'order' => 'Pedidos cancelados, expirados ou estornados não podem ser aprovados.',
                ]);
            }

            if (! $approvedPayment instanceof Payment) {
                $approvedPayment = Payment::query()->create([
                    'order_id' => $lockedOrder->id,
                    'status' => PaymentStatus::Approved,
                    'provider' => $lockedOrder->provider ?? 'manual_dev',
                    'provider_payment_id' => $payload['provider_payment_id']
                        ?? $lockedOrder->provider_reference
                        ?? 'approved_'.$lockedOrder->id,
                    'amount_cents' => $lockedOrder->amount_cents,
                    'currency' => $lockedOrder->currency,
                    'raw_payload' => [
                        'schemaVersion' => 1,
                        'source' => $payload['source'] ?? 'manual_dev',
                        'real_charge' => false,
                        'payload' => $payload,
                    ],
                    'processed_at' => now(),
                ]);
            } else {
                $approvedPayment->forceFill([
                    'amount_cents' => $lockedOrder->amount_cents,
                    'currency' => $lockedOrder->currency,
                    'processed_at' => $approvedPayment->processed_at ?? now(),
                ])->save();
            }

            if ($lockedOrder->status !== OrderStatus::Paid) {
                $lockedOrder->forceFill([
                    'status' => OrderStatus::Paid,
                    'paid_at' => now(),
                ])->save();
            }

            if (! $paymentWasAlreadyApproved) {
                $this->tracker->track(AnalyticsEventName::PaymentApproved, [
                    'source' => 'server',
                    'user' => $lockedOrder->user,
                    'gift' => $lockedOrder->gift,
                    'order' => $lockedOrder,
                    'payment' => $approvedPayment,
                    'plan' => $lockedOrder->plan,
                ], [
                    'amount_cents' => $approvedPayment->amount_cents,
                    'currency' => $approvedPayment->currency,
                    'provider' => $approvedPayment->provider,
                ]);
            }

            if (! $orderWasAlreadyPaid) {
                $this->tracker->track(AnalyticsEventName::OrderPaid, [
                    'source' => 'server',
                    'user' => $lockedOrder->user,
                    'gift' => $lockedOrder->gift,
                    'order' => $lockedOrder,
                    'payment' => $approvedPayment,
                    'plan' => $lockedOrder->plan,
                ], [
                    'amount_cents' => $lockedOrder->amount_cents,
                    'currency' => $lockedOrder->currency,
                ]);
            }

            $gift = $lockedOrder->gift;

            if ($gift === null) {
                throw ValidationException::withMessages([
                    'gift' => 'Pedido sem gift vinculado.',
                ]);
            }

            if ($gift->statusEnum() !== GiftStatus::Published) {
                $this->publishGift->handle($lockedOrder->user, $gift, paymentApproved: true);
            }

            return $approvedPayment->refresh();
        });
    }
}
