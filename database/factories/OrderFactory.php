<?php

namespace Database\Factories;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'gift_id' => Gift::factory(),
            'plan_id' => Plan::factory(),
            'status' => OrderStatus::Pending->value,
            'amount_cents' => 499,
            'currency' => 'BRL',
            'provider' => null,
            'provider_reference' => null,
            'checkout_url' => null,
            'metadata' => null,
            'paid_at' => null,
            'expires_at' => now()->addMinutes(30),
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Paid->value,
            'paid_at' => now(),
        ]);
    }
}
