<?php

namespace Tests\Feature;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Templates\Actions\CreateTemplateFromGift;
use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GiftToTemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_draft_template_from_gift_with_sanitized_canvas(): void
    {
        $admin = $this->userWithRole('admin');
        $owner = $this->userWithRole('customer');
        $occasion = Occasion::factory()->create(['name' => 'Amor', 'slug' => 'amor', 'is_active' => true]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $gift = Gift::factory()->create([
            'user_id' => $owner->id,
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
            'title' => 'Presente pessoal',
            'public_code' => 'secret-public-code',
            'recipient_name' => 'Nome real',
            'sender_name' => 'Remetente real',
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $owner->id,
            'gift_id' => $gift->id,
        ]);
        $asset = Asset::factory()->create(['name' => 'Coração do sistema']);
        $order = Order::factory()->create(['gift_id' => $gift->id, 'user_id' => $owner->id]);
        Payment::factory()->approved()->create(['order_id' => $order->id]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'page_type' => PageType::Cover->value,
            'name' => 'Capa visual',
            'sort_order' => 10,
            'canvas' => $this->canvas([
                [
                    'id' => 'photo',
                    'type' => 'image',
                    'mediaItemId' => $mediaItem->id,
                    'src' => '/app/gifts/'.$gift->id.'/media/'.$mediaItem->id,
                    'x' => 120,
                    'y' => 180,
                    'w' => 420,
                    'h' => 520,
                    'rotation' => -4,
                    'z' => 10,
                ],
                [
                    'id' => 'sticker',
                    'type' => 'sticker',
                    'assetId' => $asset->id,
                    'x' => 620,
                    'y' => 220,
                    'w' => 180,
                    'h' => 160,
                    'rotation' => 8,
                    'z' => 20,
                ],
                [
                    'id' => 'title',
                    'type' => 'text',
                    'text' => 'Texto default editável',
                    'x' => 100,
                    'y' => 820,
                    'w' => 760,
                    'h' => 120,
                    'rotation' => 0,
                    'z' => 30,
                ],
            ]),
        ]);

        $template = app(CreateTemplateFromGift::class)->handle($admin, $gift, [
            'name' => 'Template visual',
            'slug' => 'template-visual',
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
            'status' => TemplateVersionStatus::Draft->value,
        ]);

        $version = $template->versions()->firstOrFail();
        $page = $version->pages()->firstOrFail();
        $image = $page->canvas['elements'][0];
        $sticker = $page->canvas['elements'][1];

        $this->assertSame(TemplateVersionStatus::Draft, $version->status);
        $this->assertNull($version->published_at);
        $this->assertSame($occasion->id, $template->occasion_id);
        $this->assertSame($themeVersion->id, $version->theme_version_id);
        $this->assertSame('Capa visual', $page->name);
        $this->assertArrayNotHasKey('mediaItemId', $image);
        $this->assertArrayNotHasKey('media_item_id', $image);
        $this->assertArrayNotHasKey('src', $image);
        $this->assertSame('Foto principal', $image['placeholderLabel']);
        $this->assertSame($asset->id, $sticker['assetId']);
        $this->assertSame(['photo_1', 'title'], $page->editable_schema['fields']);
        $this->assertTrue((bool) $template->metadata['personalMediaSanitized']);
        $this->assertTrue((bool) $template->metadata['textsCopiedAsDefaults']);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('payments', 1);

        app(CanvasSecurity::class)->validate($page->canvas);
    }

    public function test_customer_cannot_create_template_from_gift(): void
    {
        $customer = $this->userWithRole('customer');
        $gift = Gift::factory()->create();

        $this->expectException(ValidationException::class);

        app(CreateTemplateFromGift::class)->handle($customer, $gift, [
            'name' => 'Template proibido',
            'slug' => 'template-proibido',
        ]);
    }

    public function test_gift_to_template_preserves_envelope_and_removes_personal_polaroid_media(): void
    {
        $admin = $this->userWithRole('admin');
        $owner = $this->userWithRole('customer');
        $occasion = Occasion::factory()->create(['name' => 'Amor', 'slug' => 'amor', 'is_active' => true]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $gift = Gift::factory()->create([
            'user_id' => $owner->id,
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $owner->id,
            'gift_id' => $gift->id,
        ]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'page_type' => PageType::Letter->value,
            'name' => 'Interativos',
            'sort_order' => 10,
            'canvas' => $this->canvas([
                [
                    'id' => 'letter',
                    'type' => 'interactive_envelope',
                    'title' => 'Abra quando sentir saudade',
                    'content' => 'Cartinha default editável.',
                    'x' => 100,
                    'y' => 160,
                    'w' => 520,
                    'h' => 320,
                    'rotation' => -3,
                    'z' => 10,
                    'style' => ['variant' => 'kraft'],
                    'state' => ['defaultOpen' => false],
                ],
                [
                    'id' => 'polaroid',
                    'type' => 'flip_polaroid',
                    'x' => 420,
                    'y' => 540,
                    'w' => 320,
                    'h' => 430,
                    'rotation' => 5,
                    'z' => 20,
                    'front' => [
                        'mediaItemId' => $mediaItem->id,
                        'src' => '/app/gifts/'.$gift->id.'/media/'.$mediaItem->id,
                        'placeholderLabel' => 'Foto pessoal',
                        'caption' => 'Nosso momento',
                    ],
                    'back' => [
                        'text' => 'Mensagem do verso.',
                    ],
                ],
            ]),
        ]);

        $template = app(CreateTemplateFromGift::class)->handle($admin, $gift, [
            'name' => 'Template com interativos',
            'slug' => 'template-com-interativos',
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
            'status' => TemplateVersionStatus::Draft->value,
        ]);

        $page = $template->versions()->firstOrFail()->pages()->firstOrFail();
        $envelope = $page->canvas['elements'][0];
        $polaroid = $page->canvas['elements'][1];

        $this->assertSame('interactive_envelope', $envelope['type']);
        $this->assertSame('Abra quando sentir saudade', $envelope['title']);
        $this->assertSame('Cartinha default editável.', $envelope['content']);
        $this->assertSame('flip_polaroid', $polaroid['type']);
        $this->assertSame('Nosso momento', $polaroid['front']['caption']);
        $this->assertSame('Mensagem do verso.', $polaroid['back']['text']);
        $this->assertArrayNotHasKey('mediaItemId', $polaroid['front']);
        $this->assertArrayNotHasKey('src', $polaroid['front']);
        $this->assertContains('letter', $page->editable_schema['fields']);
        $this->assertContains('interactive_photo_1', $page->editable_schema['fields']);

        app(CanvasSecurity::class)->validate($page->canvas);
    }

    public function test_published_template_created_from_gift_appears_in_creation_flow(): void
    {
        $admin = $this->userWithRole('admin');
        $occasion = Occasion::factory()->create(['name' => 'Aniversário', 'slug' => 'aniversario', 'is_active' => true]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $gift = Gift::factory()->create([
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
            'title' => 'Template publicado visual',
        ]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'sort_order' => 10,
            'canvas' => $this->canvas([
                [
                    'id' => 'title',
                    'type' => 'text',
                    'text' => 'Página publicada',
                    'x' => 120,
                    'y' => 160,
                    'w' => 720,
                    'h' => 120,
                    'rotation' => 0,
                    'z' => 10,
                ],
            ]),
        ]);

        app(CreateTemplateFromGift::class)->handle($admin, $gift, [
            'name' => 'Template publicado visual',
            'slug' => 'template-publicado-visual',
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
            'status' => TemplateVersionStatus::Published->value,
        ]);

        $this
            ->get(route('create.occasion', $occasion->slug))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('templates.0.slug', 'template-publicado-visual')
                ->where('templates.0.template_version.page_count', 1));

        $this->assertTrue(Template::query()->where('slug', 'template-publicado-visual')->exists());
    }

    public function test_gift_to_template_preserves_safe_page_background_asset(): void
    {
        $admin = $this->userWithRole('admin');
        $occasion = Occasion::factory()->create(['is_active' => true]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $gift = Gift::factory()->create([
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
        ]);
        $paper = Asset::factory()->create(['type' => AssetType::Paper->value]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([], [
                'type' => 'asset',
                'assetId' => $paper->id,
                'fit' => 'cover',
                'opacity' => 1,
            ]),
        ]);

        $template = app(CreateTemplateFromGift::class)->handle($admin, $gift, [
            'name' => 'Template com papel',
            'slug' => 'template-com-papel',
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
        ]);

        $background = $template->versions()->firstOrFail()->pages()->firstOrFail()->canvas['artboard']['background'];

        $this->assertSame('asset', $background['type']);
        $this->assertSame($paper->id, $background['assetId']);
        $this->assertArrayNotHasKey('previewUrl', $background);
        $this->assertArrayNotHasKey('storage_path', $background);
    }

    public function test_gift_to_template_normalizes_invalid_page_background_to_theme(): void
    {
        $admin = $this->userWithRole('admin');
        $occasion = Occasion::factory()->create(['is_active' => true]);
        $themeVersion = ThemeVersion::factory()->published()->create();
        $gift = Gift::factory()->create([
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
        ]);
        $sticker = Asset::factory()->create(['type' => AssetType::Sticker->value]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([], [
                'type' => 'asset',
                'assetId' => $sticker->id,
                'fit' => 'cover',
                'opacity' => 1,
            ]),
        ]);

        $template = app(CreateTemplateFromGift::class)->handle($admin, $gift, [
            'name' => 'Template papel invalido',
            'slug' => 'template-papel-invalido',
            'occasion_id' => $occasion->id,
            'theme_version_id' => $themeVersion->id,
        ]);

        $this->assertSame(
            ['type' => 'theme'],
            $template->versions()->firstOrFail()->pages()->firstOrFail()->canvas['artboard']['background'],
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<string, mixed>
     */
    private function canvas(array $elements, ?array $background = null): array
    {
        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => CanvasNormalizer::DEFAULT_WIDTH,
                'height' => CanvasNormalizer::DEFAULT_HEIGHT,
                'unit' => 'px',
                'background' => $background ?? ['type' => 'theme'],
                'safeArea' => CanvasNormalizer::DEFAULT_SAFE_AREA,
            ],
            'elements' => $elements,
        ];
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::findOrCreate($roleName, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
