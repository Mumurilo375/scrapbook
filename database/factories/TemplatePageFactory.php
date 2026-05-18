<?php

namespace Database\Factories;

use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TemplatePage>
 */
class TemplatePageFactory extends Factory
{
    protected $model = TemplatePage::class;

    public function definition(): array
    {
        return [
            'template_version_id' => TemplateVersion::factory()->published(),
            'page_type' => PageType::Generic->value,
            'name' => fake()->words(2, true),
            'sort_order' => fake()->unique()->numberBetween(1, 100000),
            'canvas' => [
                'schemaVersion' => 1,
                'version' => 1,
                'artboard' => [
                    'width' => CanvasNormalizer::DEFAULT_WIDTH,
                    'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                    'unit' => 'px',
                    'background' => ['type' => 'theme'],
                    'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
                ],
                'elements' => [],
            ],
            'editable_schema' => null,
            'constraints' => null,
            'metadata' => null,
        ];
    }
}
