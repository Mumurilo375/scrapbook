<?php

namespace Database\Factories;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Gift>
 */
class GiftFactory extends Factory
{
    protected $model = Gift::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'user_id' => User::factory(),
            'plan_id' => Plan::factory(),
            'occasion_id' => Occasion::factory(),
            'template_version_id' => TemplateVersion::factory()->published(),
            'theme_version_id' => ThemeVersion::factory()->published(),
            'title' => $title,
            'slug' => Str::slug($title),
            'public_code' => null,
            'status' => GiftStatus::Draft->value,
            'visibility' => GiftVisibility::Private->value,
            'recipient_name' => fake()->firstName(),
            'sender_name' => fake()->firstName(),
            'cover_media_id' => null,
            'settings' => ['schemaVersion' => 1],
            'limits_snapshot' => null,
            'published_at' => null,
            'expires_at' => null,
            'last_edited_at' => now(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'public_code' => Str::random(24),
            'status' => GiftStatus::Published->value,
            'visibility' => GiftVisibility::PublicLink->value,
            'published_at' => now(),
            'expires_at' => now()->addDays(180),
        ]);
    }

    public function disabled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => GiftStatus::Disabled->value,
            'visibility' => GiftVisibility::PublicLink->value,
            'public_code' => Str::random(24),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => GiftStatus::Expired->value,
            'visibility' => GiftVisibility::PublicLink->value,
            'public_code' => Str::random(24),
            'expires_at' => now()->subDay(),
        ]);
    }
}
