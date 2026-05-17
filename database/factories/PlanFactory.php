<?php

namespace Database\Factories;

use App\Domain\Payments\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->sentence(),
            'price_cents' => fake()->numberBetween(199, 999),
            'currency' => 'BRL',
            'max_pages' => 6,
            'max_photos' => 8,
            'max_storage_mb' => 50,
            'gift_lifetime_days' => 180,
            'can_use_qr_code' => true,
            'can_edit_after_publish' => true,
            'features' => ['schemaVersion' => 1],
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
