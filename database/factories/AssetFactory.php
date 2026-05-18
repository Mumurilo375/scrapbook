<?php

namespace Database\Factories;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    protected $model = Asset::class;

    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'asset_category_id' => null,
            'type' => AssetType::Sticker->value,
            'storage_disk' => 'public',
            'storage_path' => 'assets/'.Str::slug($name).'.png',
            'public_url' => null,
            'mime_type' => 'image/png',
            'size_bytes' => fake()->numberBetween(5000, 500000),
            'width' => fake()->numberBetween(64, 1024),
            'height' => fake()->numberBetween(64, 1024),
            'metadata' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }
}
