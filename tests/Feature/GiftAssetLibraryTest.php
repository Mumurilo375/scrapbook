<?php

namespace Tests\Feature;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Models\User;
use Database\Seeders\InitialDomainSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GiftAssetLibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_initial_domain_seeder_creates_asset_categories_and_placeholder_assets(): void
    {
        $this->seed(InitialDomainSeeder::class);

        $this->assertDatabaseHas('asset_categories', ['slug' => 'coracoes', 'name' => 'Corações']);
        $this->assertDatabaseHas('asset_categories', ['slug' => 'vintage', 'name' => 'Vintage']);
        $this->assertDatabaseHas('assets', ['slug' => 'coracao-recortado', 'is_active' => true]);
        $this->assertDatabaseHas('assets', ['slug' => 'papel-rasgado', 'is_active' => true]);
    }

    public function test_user_lists_active_global_assets_and_categories_for_own_draft_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $category = AssetCategory::factory()->create(['name' => 'Corações', 'slug' => 'coracoes', 'sort_order' => 10]);
        $activeAsset = $this->asset(['name' => 'Coração', 'asset_category_id' => $category->id]);
        $inactiveAsset = $this->asset(['name' => 'Inativo', 'is_active' => false]);

        $this
            ->actingAs($user)
            ->getJson(route('app.gifts.assets.index', $gift))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.categories.0.slug', 'coracoes')
            ->assertJsonPath('data.assets.0.id', $activeAsset->id)
            ->assertJsonPath('data.assets.0.category.slug', 'coracoes')
            ->assertJsonPath('data.assets.0.renderMode', 'shape')
            ->assertJsonMissing(['id' => $inactiveAsset->id])
            ->assertJsonMissing(['storage_path' => $activeAsset->storage_path]);
    }

    public function test_theme_assets_are_listed_before_global_assets_for_current_theme(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $themeAsset = $this->asset(['name' => 'Asset do tema', 'sort_order' => 99]);
        $globalAsset = $this->asset(['name' => 'Asset global', 'sort_order' => 1]);

        $gift->themeVersion->assets()->attach($themeAsset->id, [
            'id' => (string) Str::ulid(),
            'role' => 'sticker',
            'sort_order' => 1,
            'config' => json_encode(['schemaVersion' => 1, 'featured' => true], JSON_THROW_ON_ERROR),
        ]);

        $this
            ->actingAs($user)
            ->getJson(route('app.gifts.assets.index', $gift))
            ->assertOk()
            ->assertJsonPath('data.assets.0.id', $themeAsset->id)
            ->assertJsonPath('data.assets.0.source', 'theme')
            ->assertJsonPath('data.assets.0.isThemeAsset', true)
            ->assertJsonPath('data.assets.1.id', $globalAsset->id)
            ->assertJsonPath('data.assets.1.source', 'global');
    }

    public function test_user_cannot_list_assets_for_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->getJson(route('app.gifts.assets.index', $gift))
            ->assertForbidden();
    }

    public function test_guest_cannot_list_editor_assets(): void
    {
        $gift = Gift::factory()->create();

        $this
            ->get(route('app.gifts.assets.index', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_canvas_with_valid_sticker_asset_id_is_saved(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create(['gift_id' => $gift->id, 'source_template_page_id' => null]);
        $asset = $this->asset();

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    [
                        'id' => 'sticker_heart',
                        'type' => 'sticker',
                        'assetId' => $asset->id,
                        'x' => 430,
                        'y' => 520,
                        'w' => 220,
                        'h' => 220,
                        'rotation' => 0,
                        'z' => 50,
                    ],
                ]),
            ])
            ->assertOk()
            ->assertJsonPath('data.page.canvas.elements.0.assetId', $asset->id)
            ->assertJsonMissingPath('data.page.canvas.elements.0.src');

        $element = $page->refresh()->canvas['elements'][0];

        $this->assertSame($asset->id, $element['assetId']);
        $this->assertArrayNotHasKey('src', $element);
    }

    public function test_canvas_rejects_missing_inactive_or_theme_unavailable_sticker_assets(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $otherGift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create(['gift_id' => $gift->id, 'source_template_page_id' => null]);
        $inactiveAsset = $this->asset(['is_active' => false]);
        $otherThemeAsset = $this->asset();

        $otherGift->themeVersion->assets()->attach($otherThemeAsset->id, [
            'id' => (string) Str::ulid(),
            'role' => 'sticker',
            'sort_order' => 1,
            'config' => null,
        ]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    $this->stickerWithAsset('missing_asset_id'),
                ]),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.assets');

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    $this->stickerWithAsset($inactiveAsset->id),
                ]),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.assets');

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    $this->stickerWithAsset($otherThemeAsset->id),
                ]),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.assets');
    }

    public function test_canvas_rejects_manual_sticker_src_even_when_relative(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create(['gift_id' => $gift->id, 'source_template_page_id' => null]);

        $this
            ->actingAs($user)
            ->patchJson(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    [
                        'id' => 'manual_sticker',
                        'type' => 'sticker',
                        'src' => '/storage/system-assets/manual.svg',
                        'x' => 10,
                        'y' => 10,
                        'w' => 100,
                        'h' => 100,
                        'z' => 10,
                    ],
                ]),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('canvas.assets');
    }

    public function test_preview_and_public_viewer_resolve_assets_without_exposing_storage_path(): void
    {
        $user = User::factory()->create();
        $asset = $this->asset(['storage_path' => 'private/system/heart.svg']);
        $draftGift = Gift::factory()->create(['user_id' => $user->id]);
        GiftPage::factory()->create([
            'gift_id' => $draftGift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([$this->stickerWithAsset($asset->id)]),
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.preview', $draftGift))
            ->assertOk()
            ->assertDontSee('private/system/heart.svg')
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.assets.0.id', $asset->id)
                ->where('gift.pages.0.canvas.elements.0.assetId', $asset->id)
                ->missing('gift.assets.0.storage_path')
                ->missing('gift.pages.0.canvas.elements.0.storage_path'));

        $publicGift = Gift::factory()->published()->create(['user_id' => $user->id]);
        GiftPage::factory()->create([
            'gift_id' => $publicGift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([$this->stickerWithAsset($asset->id)]),
        ]);

        $this
            ->get('/p/'.$publicGift->slug.'-'.$publicGift->public_code)
            ->assertOk()
            ->assertDontSee('private/system/heart.svg')
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.assets.0.id', $asset->id)
                ->where('gift.pages.0.canvas.elements.0.assetId', $asset->id)
                ->missing('gift.assets.0.storage_path')
                ->missing('gift.pages.0.canvas.elements.0.storage_path'));
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function asset(array $overrides = []): Asset
    {
        return Asset::factory()->create(array_merge([
            'type' => AssetType::Sticker->value,
            'metadata' => [
                'schemaVersion' => 1,
                'editor' => [
                    'renderMode' => 'shape',
                    'shape' => 'heart',
                    'colors' => ['primary' => '#D9365C', 'secondary' => '#F8B7C4', 'ink' => '#7A2634'],
                    'defaultSize' => ['w' => 180, 'h' => 160],
                    'keywords' => ['amor'],
                ],
            ],
            'is_active' => true,
        ], $overrides));
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<string, mixed>
     */
    private function canvas(array $elements): array
    {
        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => ['width' => 1080, 'height' => 1350, 'unit' => 'px'],
            'elements' => $elements,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function stickerWithAsset(string $assetId): array
    {
        return [
            'id' => 'sticker_'.$assetId,
            'type' => 'sticker',
            'assetId' => $assetId,
            'x' => 100,
            'y' => 100,
            'w' => 180,
            'h' => 160,
            'rotation' => 0,
            'z' => 10,
        ];
    }
}
