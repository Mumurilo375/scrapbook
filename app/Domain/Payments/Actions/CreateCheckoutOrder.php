<?php

namespace App\Domain\Payments\Actions;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

final class CreateCheckoutOrder
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function handle(User $user, Gift $gift, Plan $plan, array $attributes = []): Order
    {
        Gate::forUser($user)->authorize('update', $gift);

        return DB::transaction(function () use ($attributes, $gift, $plan, $user): Order {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'gift_id' => $gift->id,
                'plan_id' => $plan->id,
                'status' => OrderStatus::Pending,
                'amount_cents' => $plan->price_cents,
                'currency' => $plan->currency,
                'provider' => $attributes['provider'] ?? null,
                'provider_reference' => $attributes['provider_reference'] ?? null,
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

            $gift->forceFill([
                'plan_id' => $plan->id,
                'status' => GiftStatus::PendingPayment,
                'limits_snapshot' => $plan->limitsSnapshot(),
            ])->save();

            return $order->load(['user', 'gift', 'plan']);
        });
    }
}
