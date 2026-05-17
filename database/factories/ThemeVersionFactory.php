<?php

namespace Database\Factories;

use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\Theme;
use App\Domain\Themes\Models\ThemeVersion;
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
            'config' => [
                'schemaVersion' => 1,
                'palette' => [
                    'paper' => '#f7efe2',
                    'ink' => '#3a2618',
                    'accent' => '#b85f5f',
                ],
                'fonts' => [
                    'title' => 'serif',
                    'body' => 'sans',
                ],
            ],
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
