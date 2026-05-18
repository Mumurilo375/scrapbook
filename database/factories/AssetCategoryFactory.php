<?php

namespace Database\Factories;

use App\Domain\Assets\Models\AssetCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AssetCategory>
 */
class AssetCategoryFactory extends Factory
{
    protected $model = AssetCategory::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => null,
            'icon' => null,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
            'metadata' => ['schemaVersion' => 1],
        ];
    }
}
