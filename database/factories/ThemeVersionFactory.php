<?php

namespace Database\Factories;

use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\Theme;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ThemeVersion>
 */
class ThemeVersionFactory extends Factory
{
    protected $model = ThemeVersion::class;

    public function definition(): array
    {
        return [
            'theme_id' => Theme::factory(),
            'version_number' => fake()->unique()->numberBetween(1, 100000),
            'status' => ThemeVersionStatus::Draft->value,
            'name' => 'Draft '.fake()->word(),
            'config' => ThemeConfig::defaults(),
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ThemeVersionStatus::Published->value,
            'published_at' => now(),
        ]);
    }
}
