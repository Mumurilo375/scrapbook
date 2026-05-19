<?php

namespace Tests\Feature;

use App\Domain\Assets\Models\Asset;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\VisualQuality\AssetQualityChecker;
use App\Domain\VisualQuality\CanvasQualityChecker;
use App\Domain\VisualQuality\ThemeQualityChecker;
use App\Domain\VisualQuality\VisualAuditIssue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Tests\TestCase;

class VisualQualityAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_detects_published_theme_version_without_paper_texture(): void
    {
        $themeVersion = ThemeVersion::factory()->published()->create([
            'name' => 'Kraft Vintage',
        ]);

        $issues = collect(app(ThemeQualityChecker::class)->check());

        $this->assertHasIssue($issues, 'warning', 'ThemeVersion', $themeVersion->id, 'Tema sem textura de papel');
    }

    public function test_detects_asset_without_category_as_warning(): void
    {
        $asset = Asset::factory()->create([
            'asset_category_id' => null,
        ]);

        $issues = collect(app(AssetQualityChecker::class)->check());

        $this->assertHasIssue($issues, 'warning', 'Asset', $asset->id, 'Asset sem categoria');
    }

    public function test_detects_template_page_without_artboard_as_error(): void
    {
        $page = TemplatePage::factory()->create([
            'name' => 'Capa sem artboard',
            'canvas' => [
                'schemaVersion' => 1,
                'version' => 1,
                'elements' => [],
            ],
        ]);

        $issues = $this->canvasIssues($page);

        $this->assertHasIssue($issues, 'error', 'TemplatePage', $page->id, 'TemplatePage sem artboard');
    }

    public function test_detects_media_item_id_in_template_page_as_error(): void
    {
        $page = TemplatePage::factory()->create([
            'name' => 'Foto pessoal',
            'canvas' => $this->canvas([
                [
                    'id' => 'photo_1',
                    'type' => 'image',
                    'mediaItemId' => '01HRPERSONALMEDIA',
                    'x' => 100,
                    'y' => 120,
                    'w' => 420,
                    'h' => 520,
                    'rotation' => 0,
                    'z' => 10,
                ],
            ]),
        ]);

        $issues = $this->canvasIssues($page);

        $this->assertHasIssue($issues, 'error', 'TemplatePage', $page->id, 'TemplatePage com mediaItemId em template');
    }

    public function test_detects_external_url_in_canvas_as_error(): void
    {
        $page = TemplatePage::factory()->create([
            'name' => 'Sticker externo',
            'canvas' => $this->canvas([
                [
                    'id' => 'sticker_1',
                    'type' => 'sticker',
                    'src' => 'https://example.com/sticker.png',
                    'x' => 80,
                    'y' => 90,
                    'w' => 180,
                    'h' => 180,
                    'rotation' => 0,
                    'z' => 10,
                ],
            ]),
        ]);

        $issues = $this->canvasIssues($page);

        $this->assertHasIssue($issues, 'error', 'TemplatePage', $page->id, 'TemplatePage com URL externa');
    }

    public function test_detects_invalid_background_asset_as_error(): void
    {
        $page = TemplatePage::factory()->create([
            'name' => 'Fundo quebrado',
            'canvas' => $this->canvas([], [
                'type' => 'asset',
                'assetId' => 'asset-inexistente',
            ]),
        ]);

        $issues = $this->canvasIssues($page);

        $this->assertHasIssue($issues, 'error', 'TemplatePage', $page->id, 'TemplatePage com assetId inexistente');
    }

    public function test_valid_basic_canvas_does_not_report_error(): void
    {
        $page = TemplatePage::factory()->create([
            'name' => 'Canvas valido',
            'canvas' => $this->canvas(),
        ]);

        $issues = $this->canvasIssues($page);

        $this->assertFalse(
            $issues->contains(fn (VisualAuditIssue $issue): bool => $issue->severity === 'error'),
            'Canvas básico válido não deveria gerar erro.',
        );
    }

    public function test_visual_audit_command_returns_zero_even_with_warnings(): void
    {
        Asset::factory()->create([
            'asset_category_id' => null,
        ]);

        $this
            ->artisan('scrapbook:visual-audit')
            ->assertExitCode(0);
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @param  array<string, mixed>  $background
     * @return array<string, mixed>
     */
    private function canvas(array $elements = [], array $background = ['type' => 'theme']): array
    {
        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => CanvasNormalizer::DEFAULT_WIDTH,
                'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                'unit' => 'px',
                'background' => $background,
                'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
            ],
            'elements' => $elements,
        ];
    }

    /**
     * @return Collection<int, VisualAuditIssue>
     */
    private function canvasIssues(TemplatePage $page): Collection
    {
        $assetsById = Asset::query()->get()->keyBy('id');

        return collect(app(CanvasQualityChecker::class)->checkTemplatePage($page, $assetsById));
    }

    /**
     * @param  Collection<int, VisualAuditIssue>  $issues
     */
    private function assertHasIssue(Collection $issues, string $severity, string $model, string $id, string $title): void
    {
        $this->assertTrue(
            $issues->contains(
                fn (VisualAuditIssue $issue): bool => $issue->severity === $severity
                    && $issue->model === $model
                    && $issue->id === $id
                    && $issue->title === $title,
            ),
            "Falhou ao encontrar issue {$severity}/{$model}/{$title}.",
        );
    }
}
