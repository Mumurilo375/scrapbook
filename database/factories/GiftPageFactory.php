<?php

namespace Database\Factories;

use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\TemplatePage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GiftPage>
 */
class GiftPageFactory extends Factory
{
    protected $model = GiftPage::class;

    public function definition(): array
    {
        return [
            'gift_id' => Gift::factory(),
            'source_template_page_id' => TemplatePage::factory(),
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
            'settings' => null,
            'is_visible' => true,
            'locked' => false,
        ];
    }
}
