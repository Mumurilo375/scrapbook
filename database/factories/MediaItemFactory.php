<?php

namespace Database\Factories;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MediaItem>
 */
class MediaItemFactory extends Factory
{
    protected $model = MediaItem::class;

    public function definition(): array
    {
        $filename = Str::uuid().'.jpg';

        return [
            'user_id' => User::factory(),
            'gift_id' => Gift::factory(),
            'type' => MediaType::Image->value,
            'original_filename' => 'foto.jpg',
            'storage_disk' => 'public',
            'storage_path' => 'media/'.$filename,
            'mime_type' => 'image/jpeg',
            'size_bytes' => fake()->numberBetween(5000, 1000000),
            'width' => 1200,
            'height' => 1600,
            'variants' => null,
            'metadata' => null,
            'status' => MediaStatus::Pending->value,
        ];
    }

    public function processed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MediaStatus::Processed->value,
            'variants' => [
                'thumbnail' => 'media/thumbnails/'.Str::uuid().'.jpg',
            ],
        ]);
    }
}
