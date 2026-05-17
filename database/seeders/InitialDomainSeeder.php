<?php

namespace Database\Seeders;

use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\Theme;
use App\Domain\Themes\Models\ThemeVersion;
use Illuminate\Database\Seeder;

class InitialDomainSeeder extends Seeder
{
    /**
     * Seed the minimum catalog needed for local development.
     */
    public function run(): void
    {
        $occasions = [
            ['name' => 'Amor / Namoro', 'slug' => 'amor-namoro', 'sort_order' => 10],
            ['name' => 'Feliz aniversário', 'slug' => 'feliz-aniversario', 'sort_order' => 20],
            ['name' => 'Melhor amiga', 'slug' => 'melhor-amiga', 'sort_order' => 30],
            ['name' => 'Aniversário de namoro', 'slug' => 'aniversario-de-namoro', 'sort_order' => 40],
        ];

        foreach ($occasions as $occasion) {
            Occasion::query()->updateOrCreate(
                ['slug' => $occasion['slug']],
                [
                    'name' => $occasion['name'],
                    'description' => null,
                    'is_active' => true,
                    'sort_order' => $occasion['sort_order'],
                    'metadata' => ['schemaVersion' => 1],
                ],
            );
        }

        $plan = Plan::query()->updateOrCreate(
            ['slug' => 'presente-digital'],
            [
                'name' => 'Presente Digital',
                'description' => 'Plano inicial para validar presentes digitais do MVP.',
                'price_cents' => 499,
                'currency' => 'BRL',
                'max_pages' => 6,
                'max_photos' => 8,
                'max_storage_mb' => 50,
                'gift_lifetime_days' => 180,
                'can_use_qr_code' => true,
                'can_edit_after_publish' => true,
                'features' => [
                    'schemaVersion' => 1,
                    'items' => ['link_publico', 'qr_code', 'edicao_pos_publicacao'],
                ],
                'is_active' => true,
                'sort_order' => 10,
            ],
        );

        $theme = Theme::query()->updateOrCreate(
            ['slug' => 'kraft-scrapbook-vintage'],
            [
                'name' => 'Kraft Scrapbook Vintage',
                'description' => 'Tema base com papel kraft, recortes e textura vintage.',
                'is_active' => true,
                'sort_order' => 10,
            ],
        );

        $themeVersion = ThemeVersion::query()->updateOrCreate(
            ['theme_id' => $theme->id, 'version_number' => 1],
            [
                'status' => ThemeVersionStatus::Published,
                'name' => 'Kraft Scrapbook Vintage v1',
                'config' => [
                    'schemaVersion' => 1,
                    'palette' => [
                        'paper' => '#f7efe2',
                        'kraft' => '#b68a5c',
                        'ink' => '#3a2618',
                        'rose' => '#b85f6b',
                        'wine' => '#7a2634',
                        'olive' => '#7b7a4a',
                    ],
                    'fonts' => [
                        'title' => 'serif',
                        'body' => 'sans',
                        'handwritten' => 'cursive',
                    ],
                    'background' => [
                        'texture' => 'kraft-paper',
                    ],
                    'tokens' => [
                        'radius' => '4px',
                        'shadow' => 'soft-paper',
                    ],
                    'options' => [
                        'allowBackgroundTexture' => true,
                    ],
                ],
                'published_at' => now(),
            ],
        );

        $template = Template::query()->updateOrCreate(
            ['slug' => 'cartinha-de-amor-vintage'],
            [
                'occasion_id' => Occasion::query()->where('slug', 'amor-namoro')->value('id'),
                'name' => 'Cartinha de Amor Vintage',
                'description' => 'Template estrutural inicial para presente romântico.',
                'is_active' => true,
                'sort_order' => 10,
                'metadata' => ['schemaVersion' => 1, 'seed' => true],
            ],
        );

        $templateVersion = TemplateVersion::query()->updateOrCreate(
            ['template_id' => $template->id, 'version_number' => 1],
            [
                'theme_version_id' => $themeVersion->id,
                'status' => TemplateVersionStatus::Published,
                'name' => 'Cartinha de Amor Vintage v1',
                'preview_config' => ['schemaVersion' => 1],
                'default_config' => ['schemaVersion' => 1, 'plan_id' => $plan->id],
                'published_at' => now(),
            ],
        );

        $pages = [
            [PageType::Cover, 'Capa', 10, 'Um presente para você'],
            [PageType::Letter, 'Carta principal', 20, 'Escreva sua mensagem principal'],
            [PageType::Gallery, 'Galeria', 30, 'Separe alguns momentos favoritos'],
            [PageType::Music, 'Música', 40, 'Escolha uma música por metadata externa'],
            [PageType::Final, 'Página final', 50, 'Com carinho'],
        ];

        foreach ($pages as [$pageType, $name, $sortOrder, $text]) {
            TemplatePage::query()->updateOrCreate(
                ['template_version_id' => $templateVersion->id, 'sort_order' => $sortOrder],
                [
                    'page_type' => $pageType,
                    'name' => $name,
                    'canvas' => $this->canvas($text),
                    'editable_schema' => [
                        'schemaVersion' => 1,
                        'fields' => ['main_text'],
                    ],
                    'constraints' => [
                        'schemaVersion' => 1,
                        'maxTextLength' => 500,
                    ],
                    'metadata' => ['schemaVersion' => 1],
                ],
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function canvas(string $text): array
    {
        return [
            'schemaVersion' => 1,
            'artboard' => [
                'width' => 390,
                'height' => 844,
                'safeArea' => ['top' => 24, 'right' => 16, 'bottom' => 24, 'left' => 16],
            ],
            'background' => [
                'type' => 'themeToken',
                'value' => 'paper',
            ],
            'elements' => [
                [
                    'id' => 'main_text',
                    'type' => 'text',
                    'slotKey' => 'main_text',
                    'text' => $text,
                    'x' => 32,
                    'y' => 96,
                    'w' => 326,
                    'h' => 160,
                    'rotation' => 0,
                    'z' => 10,
                    'style' => [
                        'fontToken' => 'title',
                        'fontSize' => 32,
                        'color' => 'var(--ink)',
                        'align' => 'center',
                    ],
                ],
            ],
        ];
    }
}
