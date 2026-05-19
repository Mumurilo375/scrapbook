<?php

namespace Tests\Feature;

use App\Domain\Assets\Models\Asset;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Actions\CreateGiftFromTemplate;
use App\Domain\Gifts\Actions\UpdateGiftPageCanvas;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Gifts\Services\GiftPublicationChecklist;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DomainFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_edit_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse(Gate::forUser($otherUser)->allows('update', $gift));
    }

    public function test_user_can_edit_own_draft_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this->assertTrue(Gate::forUser($user)->allows('update', $gift));
    }

    public function test_gift_created_from_template_copies_template_version_id(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertTrue($templateVersion->is($gift->templateVersion));
        $this->assertCount(2, $gift->pages);
    }

    public function test_template_page_factory_creates_canvas_with_valid_artboard(): void
    {
        $page = TemplatePage::factory()->create();

        $this->assertSame(1, $page->canvas['schemaVersion']);
        $this->assertSame(1, $page->canvas['version']);
        $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $page->canvas['artboard']['width']);
        $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $page->canvas['artboard']['height']);
        $this->assertSame('px', $page->canvas['artboard']['unit']);
        $this->assertSame(['type' => 'theme'], $page->canvas['artboard']['background']);
        $this->assertSame(CanvasNormalizer::DEFAULT_SAFE_AREA, $page->canvas['artboard']['safeArea']);
        $this->assertIsArray($page->canvas['elements']);
    }

    public function test_gift_page_factory_creates_canvas_with_valid_artboard(): void
    {
        $page = GiftPage::factory()->create([
            'source_template_page_id' => null,
        ]);

        $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $page->canvas['artboard']['width']);
        $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $page->canvas['artboard']['height']);
        $this->assertIsArray($page->canvas['elements']);
    }

    public function test_gift_created_from_template_normalizes_canvas_missing_artboard(): void
    {
        $user = User::factory()->create();
        $templateVersion = TemplateVersion::factory()->published()->create();

        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'page_type' => PageType::Cover,
            'name' => 'Capa',
            'sort_order' => 10,
            'canvas' => [
                'schemaVersion' => 1,
                'elements' => [
                    ['id' => 'title', 'type' => 'text', 'text' => 'Oi', 'x' => 10, 'y' => 20, 'w' => 100, 'h' => 40, 'z' => 1],
                ],
            ],
        ]);

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);
        $canvas = $gift->pages->firstOrFail()->canvas;

        $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $canvas['artboard']['width']);
        $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $canvas['artboard']['height']);
        $this->assertSame('title', $canvas['elements'][0]['id']);
    }

    public function test_canvas_without_artboard_is_normalized_when_saved(): void
    {
        $owner = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        app(UpdateGiftPageCanvas::class)->handle($owner, $page, [
            'schemaVersion' => 1,
            'elements' => [],
        ]);

        $canvas = $page->refresh()->canvas;

        $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $canvas['artboard']['width']);
        $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $canvas['artboard']['height']);
        $this->assertSame([], $canvas['elements']);
    }

    public function test_gift_created_from_template_copies_theme_version_id(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertSame($templateVersion->theme_version_id, $gift->theme_version_id);
    }

    public function test_only_published_template_version_can_create_public_gift_flow(): void
    {
        $user = User::factory()->create();
        $templateVersion = $this->publishedTemplateVersionWithPages();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertNotNull($gift->id);
    }

    public function test_draft_template_version_cannot_be_used_for_public_creation(): void
    {
        $user = User::factory()->create();
        $templateVersion = TemplateVersion::factory()->create();

        $this->expectException(ValidationException::class);

        app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);
    }

    public function test_user_cannot_associate_media_item_from_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $otherUser->id,
            'gift_id' => null,
        ]);

        $this->expectException(AuthorizationException::class);

        app(UpdateGiftPageCanvas::class)->handle($owner, $page, [
            'schemaVersion' => 1,
            'elements' => [
                ['id' => 'photo_1', 'type' => 'image', 'mediaItemId' => $mediaItem->id],
            ],
        ]);
    }

    public function test_public_published_gift_can_be_resolved_by_public_code(): void
    {
        $gift = Gift::factory()->published()->create();

        $resolved = Gift::query()
            ->publiclyAccessible()
            ->where('public_code', $gift->public_code)
            ->first();

        $this->assertTrue($gift->is($resolved));
    }

    public function test_disabled_or_expired_gift_cannot_be_resolved_publicly(): void
    {
        $disabledGift = Gift::factory()->disabled()->create();
        $expiredGift = Gift::factory()->expired()->create();

        $this->assertNull(Gift::query()->publiclyAccessible()->where('public_code', $disabledGift->public_code)->first());
        $this->assertNull(Gift::query()->publiclyAccessible()->where('public_code', $expiredGift->public_code)->first());
    }

    public function test_plan_uses_integer_price_cents(): void
    {
        $plan = Plan::factory()->create(['price_cents' => 499]);

        $this->assertIsInt($plan->price_cents);
        $this->assertSame(499, $plan->price_cents);
    }

    public function test_order_belongs_to_user_gift_and_plan(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $plan = Plan::factory()->create();
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
            'plan_id' => $plan->id,
        ]);

        $this->assertTrue($user->is($order->user));
        $this->assertTrue($gift->is($order->gift));
        $this->assertTrue($plan->is($order->plan));
    }

    public function test_payment_belongs_to_order(): void
    {
        $order = Order::factory()->create();
        $payment = Payment::factory()->create(['order_id' => $order->id]);

        $this->assertTrue($order->is($payment->order));
    }

    public function test_seeders_create_minimum_domain_data(): void
    {
        $this->seed();

        $this->assertDatabaseHas('roles', ['name' => 'admin']);
        $this->assertDatabaseHas('occasions', ['slug' => 'amor-namoro']);
        $this->assertDatabaseHas('plans', ['slug' => 'presente-digital', 'price_cents' => 499]);
        $this->assertDatabaseHas('themes', ['slug' => 'kraft-vintage', 'name' => 'Kraft Vintage']);
        $this->assertDatabaseHas('themes', ['slug' => 'romance-delicado', 'name' => 'Romance Delicado']);
        $this->assertDatabaseHas('themes', ['slug' => 'aniversario-fofo', 'name' => 'Aniversário Fofo']);
        $this->assertDatabaseHas('templates', ['slug' => 'amor-namoro-basico', 'name' => 'Amor / Namoro']);
        $this->assertDatabaseHas('templates', ['slug' => 'feliz-aniversario-basico', 'name' => 'Feliz Aniversário']);
        $this->assertDatabaseHas('templates', ['slug' => 'melhor-amiga-basico', 'name' => 'Melhor Amiga']);
        $this->assertDatabaseHas('templates', ['slug' => 'love-letter-scrapbook-premium', 'name' => 'Love Letter Scrapbook']);
        $this->assertDatabaseHas('templates', ['slug' => 'birthday-handmade-premium', 'name' => 'Birthday Handmade']);
        $this->assertDatabaseHas('templates', ['slug' => 'best-friends-collage-premium', 'name' => 'Best Friends Collage']);
        $this->assertDatabaseHas('templates', ['slug' => 'vintage-memory-book-premium', 'name' => 'Vintage Memory Book']);
        $this->assertDatabaseCount('themes', 3);
        $this->assertDatabaseCount('templates', 7);
        $this->assertDatabaseCount('template_pages', 35);
    }

    public function test_seeded_theme_configs_are_expressive_for_scrapbook_renderer(): void
    {
        $this->seed();

        $themeVersions = ThemeVersion::query()
            ->with('theme')
            ->where('status', 'published')
            ->get();

        $this->assertCount(3, $themeVersions);
        $this->assertCount(3, $themeVersions->pluck('config.page.surface')->unique());
        $this->assertCount(3, $themeVersions->pluck('config.tokens.colors.paper')->unique());

        foreach ($themeVersions as $themeVersion) {
            $config = ThemeConfig::publicConfig($themeVersion->config);

            $this->assertArrayHasKey('appBackground', $config['tokens']['colors']);
            $this->assertArrayHasKey('bookBackground', $config['tokens']['colors']);
            $this->assertArrayHasKey('paperAlt', $config['tokens']['colors']);
            $this->assertArrayHasKey('mutedInk', $config['tokens']['colors']);
            $this->assertArrayHasKey('accentSoft', $config['tokens']['colors']);
            $this->assertArrayHasKey('spineColor', $config['book']);
            $this->assertArrayHasKey('transition', $config['book']);
            $this->assertArrayHasKey('transitionIntensity', $config['book']);
            $this->assertTrue($config['book']['motion']);
            $this->assertArrayHasKey('texture', $config['page']);
            $this->assertArrayHasKey('edge', $config['page']);
            $this->assertTrue($config['page']['decorations']['paperGrain']);
            $this->assertTrue($config['elements']['image']['shadow']);
            $this->assertTrue($config['elements']['sticker']['shadow']);
        }
    }

    public function test_seeded_templates_use_different_published_themes(): void
    {
        $this->seed();

        $templateThemes = TemplateVersion::query()
            ->where('status', 'published')
            ->whereHas('template', fn ($query) => $query->whereIn('slug', [
                'amor-namoro-basico',
                'feliz-aniversario-basico',
                'melhor-amiga-basico',
            ]))
            ->with('themeVersion.theme')
            ->get()
            ->map(fn (TemplateVersion $templateVersion): ?string => $templateVersion->themeVersion?->theme?->slug)
            ->filter()
            ->values();

        $this->assertCount(3, $templateThemes);
        $this->assertCount(3, $templateThemes->unique());
    }

    public function test_each_seeded_template_page_has_valid_artboard(): void
    {
        $this->seed();

        $templateSlugs = [
            'amor-namoro-basico',
            'feliz-aniversario-basico',
            'melhor-amiga-basico',
            'love-letter-scrapbook-premium',
            'birthday-handmade-premium',
            'best-friends-collage-premium',
            'vintage-memory-book-premium',
        ];

        $pages = TemplatePage::query()
            ->whereHas('templateVersion.template', fn ($query) => $query->whereIn('slug', $templateSlugs))
            ->get();

        $this->assertCount(35, $pages);

        foreach ($pages as $page) {
            $this->assertSame(1, $page->canvas['schemaVersion']);
            $this->assertSame(1, $page->canvas['version']);
            $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $page->canvas['artboard']['width']);
            $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $page->canvas['artboard']['height']);
            $this->assertSame('px', $page->canvas['artboard']['unit']);
            $this->assertEquals(CanvasNormalizer::DEFAULT_SAFE_AREA, $page->canvas['artboard']['safeArea']);
            $this->assertIsArray($page->canvas['elements']);
        }
    }

    public function test_premium_templates_are_published_with_safe_organic_canvases(): void
    {
        $this->seed();

        $premiumSlugs = [
            'love-letter-scrapbook-premium',
            'birthday-handmade-premium',
            'best-friends-collage-premium',
            'vintage-memory-book-premium',
        ];

        $versions = TemplateVersion::query()
            ->where('status', 'published')
            ->whereHas('template', fn ($query) => $query->whereIn('slug', $premiumSlugs))
            ->with(['pages', 'template'])
            ->get();

        $this->assertCount(4, $versions);

        $assets = Asset::query()
            ->with('themeVersions')
            ->get()
            ->keyBy('id');
        $canvasSecurity = app(CanvasSecurity::class);
        $interactiveTypes = [];

        foreach ($versions as $version) {
            $this->assertTrue((bool) data_get($version->default_config, 'premium'));
            $this->assertCount(5, $version->pages);

            foreach ($version->pages as $page) {
                $canvas = $page->canvas;

                $canvasSecurity->validate($canvas, 1000);

                $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $canvas['artboard']['width']);
                $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $canvas['artboard']['height']);
                $this->assertGreaterThanOrEqual(6, count($canvas['elements']));

                $imageElements = collect($canvas['elements'])
                    ->filter(fn (array $element): bool => ($element['type'] ?? null) === 'image');

                foreach ($imageElements as $element) {
                    $this->assertArrayNotHasKey('mediaItemId', $element);
                    $this->assertArrayNotHasKey('media_item_id', $element);
                    $this->assertNotSame('', trim((string) ($element['name'] ?? '')));
                    $this->assertNotSame('', trim((string) ($element['placeholderLabel'] ?? '')));
                }

                foreach ($canvas['elements'] as $element) {
                    if (in_array($element['type'] ?? null, ['interactive_envelope', 'flip_polaroid'], true)) {
                        $interactiveTypes[] = $element['type'];
                    }

                    if (isset($element['assetId'])) {
                        $asset = $assets->get($element['assetId']);

                        $this->assertNotNull($asset);
                        $this->assertTrue(
                            $asset->themeVersions->isEmpty()
                            || $asset->themeVersions->contains('id', $version->theme_version_id),
                            'Template premium referencia asset indisponível para o tema publicado.',
                        );
                    }

                    foreach (['text', 'label', 'content'] as $textKey) {
                        if (! isset($element[$textKey])) {
                            continue;
                        }

                        $this->assertStringNotContainsString('<script', strtolower((string) $element[$textKey]));
                        $this->assertStringNotContainsString('<', (string) $element[$textKey]);
                        $this->assertStringNotContainsString('http://', (string) $element[$textKey]);
                        $this->assertStringNotContainsString('https://', (string) $element[$textKey]);
                    }
                }
            }
        }

        $this->assertContains('interactive_envelope', $interactiveTypes);
        $this->assertContains('flip_polaroid', $interactiveTypes);
    }

    public function test_premium_template_can_create_gift_with_copied_elements(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $templateVersion = TemplateVersion::query()
            ->where('name', 'Love Letter Scrapbook v1')
            ->firstOrFail();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);

        $this->assertCount(5, $gift->pages);

        foreach ($gift->pages as $page) {
            $this->assertNotNull($page->source_template_page_id);
            $this->assertGreaterThanOrEqual(6, count($page->canvas['elements']));
            $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $page->canvas['artboard']['width']);
        }
    }

    public function test_seeded_template_creates_gift_that_passes_publication_checklist(): void
    {
        $this->seed();

        $user = User::factory()->create();
        $templateVersion = TemplateVersion::query()
            ->where('name', 'Amor / Namoro v1')
            ->firstOrFail();

        $gift = app(CreateGiftFromTemplate::class)->handle($user, $templateVersion);
        $checks = app(GiftPublicationChecklist::class)->evaluate($user, $gift);

        $this->assertTrue(app(GiftPublicationChecklist::class)->canPublish($checks));
        $this->assertCount(5, $gift->pages);

        foreach ($gift->pages as $page) {
            $this->assertSame(CanvasNormalizer::DEFAULT_WIDTH, $page->canvas['artboard']['width']);
            $this->assertSame(CanvasNormalizer::DEFAULT_HEIGHT, $page->canvas['artboard']['height']);
            $this->assertSame('px', $page->canvas['artboard']['unit']);
        }
    }

    public function test_incomplete_theme_config_uses_safe_visual_fallbacks(): void
    {
        $config = ThemeConfig::publicConfig([
            'tokens' => [
                'colors' => [
                    'paper' => '#FFF1DD',
                ],
            ],
            'page' => [
                'texture' => 'soft-confetti',
            ],
        ]);

        $this->assertSame('#FFF1DD', $config['tokens']['colors']['paper']);
        $this->assertSame('#F3E7D3', $config['tokens']['colors']['appBackground']);
        $this->assertSame('#D8BE96', $config['tokens']['colors']['bookBackground']);
        $this->assertSame('#7B4F32', $config['book']['spineColor']);
        $this->assertSame('soft-slide', $config['book']['transition']);
        $this->assertSame('medium', $config['book']['transitionIntensity']);
        $this->assertTrue($config['book']['motion']);
        $this->assertSame('soft-confetti', $config['page']['texture']);
        $this->assertSame('#FFF8EC', $config['page']['backgroundColor']);
        $this->assertTrue($config['page']['decorations']['paperGrain']);
    }

    public function test_publication_checklist_rejects_invalid_artboard(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Capa',
            'canvas' => [
                'schemaVersion' => 1,
                'version' => 1,
                'artboard' => [
                    'width' => 0,
                    'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                    'unit' => 'px',
                    'background' => ['type' => 'theme'],
                    'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
                ],
                'elements' => [],
            ],
        ]);

        $checks = app(GiftPublicationChecklist::class)->evaluate($user, $gift);
        $canvasCheck = collect($checks)->firstWhere('key', 'canvas');

        $this->assertFalse($canvasCheck['passed']);
    }

    private function publishedTemplateVersionWithPages(): TemplateVersion
    {
        $templateVersion = TemplateVersion::factory()->published()->create();

        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'page_type' => PageType::Cover,
            'name' => 'Capa',
            'sort_order' => 10,
        ]);

        TemplatePage::factory()->create([
            'template_version_id' => $templateVersion->id,
            'page_type' => PageType::Letter,
            'name' => 'Carta',
            'sort_order' => 20,
        ]);

        return $templateVersion->refresh();
    }
}
