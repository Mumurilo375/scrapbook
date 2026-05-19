<?php

namespace App\Domain\Payments\Actions;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Domain\Payments\PaymentProviderManager;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class CreateCheckoutOrder
{
    public function __construct(
        private readonly GiftPublicationChecklist $checklist,
        private readonly PaymentProviderManager $providers,
        private readonly AnalyticsTracker $tracker,
    ) {}

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $user, Gift $gift, Plan $plan, array $attributes = []): Order
    {
        Gate::forUser($user)->authorize('view', $gift);

        if (! $plan->is_active) {
            throw ValidationException::withMessages([
                'plan' => 'O plano selecionado não está ativo.',
            ]);
        }

        return DB::transaction(function () use ($gift, $plan, $user): Order {
            $pendingOrder = Order::query()
                ->where('user_id', $user->id)
                ->where('gift_id', $gift->id)
                ->where('status', OrderStatus::Pending->value)
                ->latest()
                ->first();

            if ($pendingOrder instanceof Order) {
                if ($gift->statusEnum() !== GiftStatus::PendingPayment) {
                    $gift->forceFill([
                        'status' => GiftStatus::PendingPayment,
                    ])->save();
                }

                return $pendingOrder->load(['user', 'gift', 'plan', 'payments']);
            }

            $paidOrder = Order::query()
                ->where('user_id', $user->id)
                ->where('gift_id', $gift->id)
                ->where('status', OrderStatus::Paid->value)
                ->latest('paid_at')
                ->first();

            if ($paidOrder instanceof Order) {
                return $paidOrder->load(['user', 'gift', 'plan', 'payments']);
            }

            $checks = $this->checklist->evaluate($user, $gift);

            if (! $this->checklist->canPublish($checks)) {
                throw ValidationException::withMessages([
                    'checkout' => 'Este gift ainda não pode avançar para checkout.',
                    ...$this->checklist->errorMessages($checks),
                ]);
            }

            $order = Order::query()->create([
                'user_id' => $user->id,
                'gift_id' => $gift->id,
                'plan_id' => $plan->id,
                'status' => OrderStatus::Pending,
                'amount_cents' => $plan->price_cents,
                'currency' => $plan->currency,
                'provider' => null,
                'provider_reference' => null,
                'checkout_url' => null,
                'metadata' => [
                    'schemaVersion' => 1,
                    'price_snapshot' => [
                        'plan_id' => $plan->id,
                        'name' => $plan->name,
                        'price_cents' => $plan->price_cents,
                        'currency' => $plan->currency,
                    ],
                    'limits_snapshot' => $plan->limitsSnapshot(),
                ],
                'expires_at' => now()->addMinutes(30),
            ]);

            $checkoutSession = $this->providers->checkoutProvider()->createCheckout($order);

            $order->forceFill([
                'provider' => $checkoutSession->provider,
                'provider_reference' => $checkoutSession->providerReference,
                'checkout_url' => $checkoutSession->checkoutUrl,
                'metadata' => array_merge($order->metadata ?? [], [
                    'checkout_session' => $checkoutSession->metadata,
                ]),
            ])->save();

            $gift->forceFill([
                'plan_id' => $plan->id,
                'status' => GiftStatus::PendingPayment,
                'limits_snapshot' => $plan->limitsSnapshot(),
            ])->save();

            $this->tracker->track(AnalyticsEventName::GiftSentToCheckout, [
                'source' => 'server',
                'user' => $user,
                'gift' => $gift,
                'order' => $order,
                'plan' => $plan,
            ]);

            $this->tracker->track(AnalyticsEventName::OrderCreated, [
                'source' => 'server',
                'user' => $user,
                'gift' => $gift,
                'order' => $order,
                'plan' => $plan,
            ], [
                'amount_cents' => $order->amount_cents,
                'currency' => $order->currency,
                'provider' => $order->provider,
            ]);

            $this->tracker->track(AnalyticsEventName::PaymentPending, [
                'source' => 'server',
                'user' => $user,
                'gift' => $gift,
                'order' => $order,
                'plan' => $plan,
            ]);

            return $order->load(['user', 'gift', 'plan', 'payments']);
        });
    }
}
