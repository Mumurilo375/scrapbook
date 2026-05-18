<?php

namespace Database\Seeders;

use App\Domain\Editor\CanvasNormalizer;
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
use App\Domain\Themes\ThemeConfig;
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

        $themeVersions = [];

        foreach ($this->themeDefinitions() as $themeDefinition) {
            $themeVersions[$themeDefinition['slug']] = $this->seedTheme($themeDefinition);
        }

        foreach ($this->templateDefinitions($plan->id) as $templateDefinition) {
            $this->seedTemplate($templateDefinition, $themeVersions);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function themeDefinitions(): array
    {
        return [
            [
                'slug' => 'kraft-vintage',
                'name' => 'Kraft Vintage',
                'description' => 'Tema com papel kraft, marrom, creme, textura de jornal antigo e sombra quente.',
                'sort_order' => 10,
                'version_name' => 'Kraft Vintage v1',
                'config' => [
                    'tokens' => [
                        'colors' => [
                            'appBackground' => '#D7B98E',
                            'bookBackground' => '#B9875C',
                            'paper' => '#F6E1B8',
                            'paperAlt' => '#E4C38B',
                            'ink' => '#3A2418',
                            'mutedInk' => '#7B5A43',
                            'accent' => '#7F3B20',
                            'accentSoft' => '#C99664',
                            'shadow' => 'rgba(58,36,24,0.28)',
                            'muted' => '#A77B55',
                            'tape' => '#D1A25F',
                            'leaf' => '#6E6C42',
                        ],
                    ],
                    'book' => [
                        'style' => 'scrapbook',
                        'binding' => 'left',
                        'background' => '#C19768',
                        'spineColor' => '#6F4328',
                    ],
                    'page' => [
                        'surface' => 'kraft',
                        'backgroundColor' => '#F6E1B8',
                        'texture' => 'vintage-stains',
                        'edge' => 'deckled',
                        'borderRadius' => 26,
                        'shadow' => 'deep-paper',
                        'padding' => 56,
                        'decorations' => [
                            'cornerTape' => true,
                            'paperGrain' => true,
                            'subtleStains' => true,
                            'edgeWear' => true,
                        ],
                    ],
                    'elements' => [
                        'text' => ['defaultColor' => '#3A2418', 'headingColor' => '#3A2418'],
                        'image' => ['defaultFrame' => 'polaroid', 'shadow' => true],
                        'sticker' => ['shadow' => true],
                    ],
                ],
            ],
            [
                'slug' => 'romance-delicado',
                'name' => 'Romance Delicado',
                'description' => 'Tema romântico suave com off-white rosado, creme, rosa queimado e vinho.',
                'sort_order' => 20,
                'version_name' => 'Romance Delicado v1',
                'config' => [
                    'tokens' => [
                        'colors' => [
                            'appBackground' => '#FAEEF0',
                            'bookBackground' => '#E9C7CA',
                            'paper' => '#FFF8EF',
                            'paperAlt' => '#F8DFD8',
                            'ink' => '#3C2630',
                            'mutedInk' => '#8C6670',
                            'accent' => '#8E2F45',
                            'accentSoft' => '#E4A2A8',
                            'shadow' => 'rgba(76,38,48,0.16)',
                            'muted' => '#C98E91',
                            'tape' => '#F3D5CF',
                            'leaf' => '#8D9A72',
                        ],
                    ],
                    'book' => [
                        'style' => 'journal',
                        'binding' => 'left',
                        'background' => '#F3D9DC',
                        'spineColor' => '#9B5866',
                    ],
                    'page' => [
                        'surface' => 'romantic-letter',
                        'backgroundColor' => '#FFF7EA',
                        'texture' => 'soft-petal',
                        'edge' => 'journal',
                        'borderRadius' => 36,
                        'shadow' => 'soft',
                        'padding' => 56,
                        'decorations' => [
                            'cornerTape' => true,
                            'paperGrain' => true,
                            'subtleStains' => true,
                            'edgeWear' => true,
                        ],
                    ],
                    'elements' => [
                        'text' => ['defaultColor' => '#3C2630', 'headingColor' => '#8E2F45'],
                        'image' => ['defaultFrame' => 'polaroid', 'shadow' => true],
                        'sticker' => ['shadow' => true],
                    ],
                ],
            ],
            [
                'slug' => 'aniversario-fofo',
                'name' => 'Aniversário Fofo',
                'description' => 'Tema jovem, alegre e controlado com pêssego, rosa suave e dourado envelhecido.',
                'sort_order' => 30,
                'version_name' => 'Aniversário Fofo v1',
                'config' => [
                    'tokens' => [
                        'colors' => [
                            'appBackground' => '#FFF0DC',
                            'bookBackground' => '#F0B98D',
                            'paper' => '#FFF9F0',
                            'paperAlt' => '#FFE1C7',
                            'ink' => '#3F2A24',
                            'mutedInk' => '#8A5F52',
                            'accent' => '#D76D6A',
                            'accentSoft' => '#F6B6A7',
                            'shadow' => 'rgba(110,61,39,0.18)',
                            'muted' => '#D6A247',
                            'tape' => '#F4C77C',
                            'leaf' => '#8D9A72',
                        ],
                    ],
                    'book' => [
                        'style' => 'scrapbook',
                        'binding' => 'left',
                        'background' => '#FFD6B0',
                        'spineColor' => '#C98258',
                    ],
                    'page' => [
                        'surface' => 'birthday-card',
                        'backgroundColor' => '#FFF9F0',
                        'texture' => 'soft-confetti',
                        'edge' => 'soft-rounded',
                        'borderRadius' => 34,
                        'shadow' => 'soft',
                        'padding' => 56,
                        'decorations' => [
                            'cornerTape' => true,
                            'paperGrain' => true,
                            'subtleStains' => true,
                            'edgeWear' => true,
                        ],
                    ],
                    'elements' => [
                        'text' => ['defaultColor' => '#3F2A24', 'headingColor' => '#C9505C'],
                        'image' => ['defaultFrame' => 'polaroid', 'shadow' => true],
                        'sticker' => ['shadow' => true],
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function templateDefinitions(string $planId): array
    {
        return [
            [
                'slug' => 'amor-namoro-basico',
                'name' => 'Amor / Namoro',
                'description' => 'Template de namoro com capa, carta, galeria, música e página final.',
                'occasion_slug' => 'amor-namoro',
                'theme_slug' => 'kraft-vintage',
                'sort_order' => 10,
                'version_name' => 'Amor / Namoro v1',
                'plan_id' => $planId,
                'pages' => [
                    ['page_type' => PageType::Cover, 'name' => 'Capa', 'sort_order' => 10, 'layout' => 'cover', 'text' => 'Um presente para você', 'sticker' => 'feito com amor'],
                    ['page_type' => PageType::Letter, 'name' => 'Carta principal', 'sort_order' => 20, 'layout' => 'letter', 'text' => "Escreva aqui aquela mensagem que parece dobrada e guardada no bolso.\n\nUse este espaço para contar o que só vocês entendem.", 'sticker' => 'cartinha'],
                    ['page_type' => PageType::Gallery, 'name' => 'Galeria', 'sort_order' => 30, 'layout' => 'gallery', 'text' => 'Um momento favorito', 'sticker' => 'aquele dia', 'image_rotation' => -2],
                    ['page_type' => PageType::Music, 'name' => 'Música', 'sort_order' => 40, 'layout' => 'music', 'text' => 'Uma trilha para lembrar de nós', 'music_title' => 'Nossa música'],
                    ['page_type' => PageType::Final, 'name' => 'Página final', 'sort_order' => 50, 'layout' => 'final', 'text' => 'Com carinho, sempre.', 'sticker' => 'fim'],
                ],
            ],
            [
                'slug' => 'feliz-aniversario-basico',
                'name' => 'Feliz Aniversário',
                'description' => 'Template de aniversário com parabéns, galeria, admiração e fechamento.',
                'occasion_slug' => 'feliz-aniversario',
                'theme_slug' => 'aniversario-fofo',
                'sort_order' => 20,
                'version_name' => 'Feliz Aniversário v1',
                'plan_id' => $planId,
                'pages' => [
                    ['page_type' => PageType::Cover, 'name' => 'Capa de aniversário', 'sort_order' => 10, 'layout' => 'cover', 'text' => 'Feliz aniversário', 'sticker' => 'dia especial'],
                    ['page_type' => PageType::Letter, 'name' => 'Mensagem de parabéns', 'sort_order' => 20, 'layout' => 'letter', 'text' => "Hoje é dia de celebrar você.\n\nEscreva aqui uma mensagem leve, bonita e cheia de carinho para marcar este novo ciclo.", 'sticker' => 'parabéns'],
                    ['page_type' => PageType::Gallery, 'name' => 'Galeria', 'sort_order' => 30, 'layout' => 'gallery', 'text' => 'Uma lembrança que merece moldura', 'sticker' => 'brilho do dia', 'image_rotation' => 2],
                    ['page_type' => PageType::Generic, 'name' => 'Coisas que admiro em você', 'sort_order' => 40, 'layout' => 'list', 'text' => 'Coisas que amo e admiro em você', 'items' => ['Seu jeito de cuidar', 'Sua risada fácil', 'A coragem de ser você'], 'sticker' => 'admiro você'],
                    ['page_type' => PageType::Final, 'name' => 'Página final', 'sort_order' => 50, 'layout' => 'final', 'text' => 'Que seu novo ciclo seja leve, bonito e cheio de boas histórias.', 'sticker' => 'celebrar'],
                ],
            ],
            [
                'slug' => 'melhor-amiga-basico',
                'name' => 'Melhor Amiga',
                'description' => 'Template de amizade com capa, história, momentos, piadas internas e final.',
                'occasion_slug' => 'melhor-amiga',
                'theme_slug' => 'romance-delicado',
                'sort_order' => 30,
                'version_name' => 'Melhor Amiga v1',
                'plan_id' => $planId,
                'pages' => [
                    ['page_type' => PageType::Cover, 'name' => 'Capa', 'sort_order' => 10, 'layout' => 'cover', 'text' => 'Nosso caderno de memórias', 'sticker' => 'melhor amiga'],
                    ['page_type' => PageType::Letter, 'name' => 'Nossa amizade', 'sort_order' => 20, 'layout' => 'letter', 'text' => "Algumas amizades viram casa.\n\nEste espaço é para guardar conselhos, viagens, conversas longas e tudo que ficou bonito no caminho.", 'sticker' => 'guardado'],
                    ['page_type' => PageType::Gallery, 'name' => 'Melhores momentos', 'sort_order' => 30, 'layout' => 'gallery', 'text' => 'Uma memória para guardar no papel', 'sticker' => 'saudade boa', 'image_rotation' => -1],
                    ['page_type' => PageType::Generic, 'name' => 'Piadas e memórias', 'sort_order' => 40, 'layout' => 'list', 'text' => 'Piadas, códigos e memórias', 'items' => ['A frase que só a gente entende', 'Aquele rolê que virou lenda', 'O conselho que salvou o dia'], 'sticker' => 'só a gente'],
                    ['page_type' => PageType::Final, 'name' => 'Página final', 'sort_order' => 50, 'layout' => 'final', 'text' => 'Obrigada por ser parte da minha história.', 'sticker' => 'sempre'],
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $definition
     */
    private function seedTheme(array $definition): ThemeVersion
    {
        $theme = Theme::query()->updateOrCreate(
            ['slug' => $definition['slug']],
            [
                'name' => $definition['name'],
                'description' => $definition['description'],
                'is_active' => true,
                'sort_order' => $definition['sort_order'],
            ],
        );

        return ThemeVersion::query()->updateOrCreate(
            ['theme_id' => $theme->id, 'version_number' => 1],
            [
                'status' => ThemeVersionStatus::Published,
                'name' => $definition['version_name'],
                'config' => ThemeConfig::normalize($definition['config']),
                'published_at' => now(),
            ],
        );
    }

    /**
     * @param  array<string, mixed>  $definition
     * @param  array<string, ThemeVersion>  $themeVersions
     */
    private function seedTemplate(array $definition, array $themeVersions): void
    {
        $template = Template::query()->updateOrCreate(
            ['slug' => $definition['slug']],
            [
                'occasion_id' => Occasion::query()->where('slug', $definition['occasion_slug'])->value('id'),
                'name' => $definition['name'],
                'description' => $definition['description'],
                'is_active' => true,
                'sort_order' => $definition['sort_order'],
                'metadata' => ['schemaVersion' => 1, 'seed' => true],
            ],
        );

        $templateVersion = TemplateVersion::query()->updateOrCreate(
            ['template_id' => $template->id, 'version_number' => 1],
            [
                'theme_version_id' => $themeVersions[$definition['theme_slug']]->id,
                'status' => TemplateVersionStatus::Published,
                'name' => $definition['version_name'],
                'preview_config' => ['schemaVersion' => 1],
                'default_config' => ['schemaVersion' => 1, 'plan_id' => $definition['plan_id']],
                'published_at' => now(),
            ],
        );

        foreach ($definition['pages'] as $page) {
            TemplatePage::query()->updateOrCreate(
                ['template_version_id' => $templateVersion->id, 'sort_order' => $page['sort_order']],
                [
                    'page_type' => $page['page_type'],
                    'name' => $page['name'],
                    'canvas' => $this->canvas($page),
                    'editable_schema' => [
                        'schemaVersion' => 1,
                        'fields' => ['main_text', 'photo_1'],
                    ],
                    'constraints' => [
                        'schemaVersion' => 1,
                        'maxTextLength' => 700,
                    ],
                    'metadata' => ['schemaVersion' => 1],
                ],
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function canvas(array $page): array
    {
        $layout = $page['layout'] ?? 'letter';
        $text = (string) ($page['text'] ?? '');
        $elements = [];

        if ($layout === 'cover') {
            $elements[] = $this->textElement('main_text', $text, 120, 185, 840, 250, 86, 'heading', 'center', 10);
            $elements[] = $this->stickerElement('seed_sticker', (string) ($page['sticker'] ?? 'feito com carinho'), 92, 78, 255, 92, -7, 20);
        } elseif ($layout === 'gallery') {
            $elements[] = $this->textElement('main_text', $text, 120, 110, 840, 130, 54, 'heading', 'center', 10);
            $elements[] = [
                'id' => 'photo_1',
                'type' => 'image',
                'slotKey' => 'photo_1',
                'alt' => 'Foto principal',
                'x' => 145,
                'y' => 315,
                'w' => 790,
                'h' => 650,
                'rotation' => (int) ($page['image_rotation'] ?? -2),
                'z' => 20,
            ];
            $elements[] = $this->stickerElement('caption_sticker', (string) ($page['sticker'] ?? 'nosso momento'), 330, 1020, 420, 110, 3, 30);
        } elseif ($layout === 'music') {
            $elements[] = $this->textElement('main_text', $text, 125, 180, 830, 230, 62, 'heading', 'center', 10);
            $elements[] = [
                'id' => 'music_card',
                'type' => 'music',
                'slotKey' => 'music_card',
                'title' => (string) ($page['music_title'] ?? 'Nossa trilha sonora'),
                'x' => 150,
                'y' => 585,
                'w' => 780,
                'h' => 140,
                'rotation' => -1,
                'z' => 20,
            ];
        } elseif ($layout === 'list') {
            $elements[] = $this->textElement('main_text', $text, 120, 125, 840, 150, 58, 'heading', 'center', 10);

            foreach (array_values((array) ($page['items'] ?? [])) as $index => $item) {
                $elements[] = $this->textElement(
                    'list_item_'.($index + 1),
                    (string) $item,
                    160,
                    360 + ($index * 155),
                    760,
                    110,
                    42,
                    'body',
                    'left',
                    20 + $index,
                );
            }

            $elements[] = $this->stickerElement('list_sticker', (string) ($page['sticker'] ?? 'memória'), 610, 850, 300, 104, 5, 40);
        } elseif ($layout === 'final') {
            $elements[] = $this->textElement('main_text', $text, 150, 390, 780, 360, 68, 'handwritten', 'center', 10);
            $elements[] = $this->stickerElement('final_sticker', (string) ($page['sticker'] ?? 'com carinho'), 365, 790, 350, 110, -4, 20);
        } else {
            $elements[] = $this->textElement('main_text', $text, 125, 170, 830, 760, 48, 'handwritten', 'left', 10);
            $elements[] = $this->stickerElement('note_sticker', (string) ($page['sticker'] ?? 'nota especial'), 690, 960, 250, 92, 6, 20);
        }

        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => CanvasNormalizer::DEFAULT_WIDTH,
                'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                'unit' => 'px',
                'background' => [
                    'type' => 'theme',
                ],
                'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
            ],
            'background' => [
                'type' => 'themeToken',
                'value' => 'paper',
            ],
            'elements' => $elements,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function textElement(
        string $id,
        string $text,
        int $x,
        int $y,
        int $w,
        int $h,
        int $fontSize,
        string $fontToken,
        string $align,
        int $z,
    ): array {
        return [
            'id' => $id,
            'type' => 'text',
            'slotKey' => $id,
            'text' => $text,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => 0,
            'z' => $z,
            'style' => [
                'fontToken' => $fontToken,
                'fontSize' => $fontSize,
                'color' => 'var(--ink)',
                'align' => $align,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function stickerElement(string $id, string $label, int $x, int $y, int $w, int $h, int $rotation, int $z): array
    {
        return [
            'id' => $id,
            'type' => 'sticker',
            'slotKey' => $id,
            'label' => $label,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
            'rotation' => $rotation,
            'z' => $z,
        ];
    }
}
