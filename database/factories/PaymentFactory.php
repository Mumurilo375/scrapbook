<?php

namespace Database\Factories;

use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'status' => PaymentStatus::Pending->value,
            'provider' => 'manual',
            'provider_payment_id' => null,
            'amount_cents' => 499,
            'currency' => 'BRL',
            'raw_payload' => null,
            'processed_at' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Approved->value,
            'processed_at' => now(),
        ]);
    }
}
