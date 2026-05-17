<?php

namespace Database\Factories;

use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TemplateVersion>
 */
class TemplateVersionFactory extends Factory
{
    protected $model = TemplateVersion::class;

    public function definition(): array
    {
        return [
            'template_id' => Template::factory(),
            'theme_version_id' => ThemeVersion::factory()->published(),
            'version_number' => fake()->unique()->numberBetween(1, 100000),
            'status' => TemplateVersionStatus::Draft->value,
            'name' => 'Draft '.fake()->word(),
            'preview_config' => ['schemaVersion' => 1],
            'default_config' => ['schemaVersion' => 1],
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => TemplateVersionStatus::Published->value,
            'published_at' => now(),
        ]);
    }
}
