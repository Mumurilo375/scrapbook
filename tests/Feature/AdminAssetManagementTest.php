<?php

namespace Tests\Feature;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use App\Filament\Resources\AssetCategories\Pages\CreateAssetCategory;
use App\Filament\Resources\Assets\AssetResource;
use App\Filament\Resources\Assets\Pages\CreateAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminAssetManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_asset_category(): void
    {
        $admin = $this->userWithRole('admin');

        Livewire::actingAs($admin)
            ->test(CreateAssetCategory::class)
            ->fillForm([
                'name' => 'Texturas',
                'slug' => 'texturas',
                'description' => 'Papéis e texturas reais para o scrapbook.',
                'icon' => 'scan-text',
                'is_active' => true,
                'sort_order' => 10,
                'metadata' => json_encode(['schemaVersion' => 1], JSON_THROW_ON_ERROR),
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('asset_categories', [
            'slug' => 'texturas',
            'name' => 'Texturas',
        ]);
    }

    public function test_customer_cannot_access_asset_admin(): void
    {
        $customer = $this->userWithRole('customer');

        $this
            ->actingAs($customer)
            ->get(AssetResource::getUrl())
            ->assertForbidden();
    }

    public function test_support_can_access_asset_admin(): void
    {
        $support = $this->userWithRole('support');

        $this
            ->actingAs($support)
            ->get(AssetResource::getUrl())
            ->assertOk();
    }

    public function test_admin_can_create_asset_with_png_upload(): void
    {
        Storage::fake('assets');
        config(['scrapbook.assets.disk' => 'assets']);

        $admin = $this->userWithRole('admin');
        $category = AssetCategory::factory()->create(['name' => 'Corações', 'slug' => 'coracoes']);

        Livewire::actingAs($admin)
            ->test(CreateAsset::class)
            ->fillForm($this->assetFormData($category, UploadedFile::fake()->image('heart.png', 64, 48)))
            ->call('create')
            ->assertHasNoFormErrors();

        $asset = Asset::query()->where('slug', 'coracao-real')->firstOrFail();

        $this->assertSame('image/png', $asset->mime_type);
        $this->assertSame(64, $asset->width);
        $this->assertSame(48, $asset->height);
        $this->assertGreaterThan(0, $asset->size_bytes);
        $this->assertSame('assets', $asset->storage_disk);
        $this->assertStringStartsWith('system/assets/', $asset->storage_path);
        $this->assertStringEndsWith('/asset.png', $asset->storage_path);
        $this->assertNull($asset->public_url);
        $this->assertSame('sticker', $asset->metadata['renderStyle']);
        $this->assertTrue($asset->metadata['physical']['whiteBorder']);

        Storage::disk('assets')->assertExists($asset->storage_path);
    }

    public function test_admin_can_create_asset_with_webp_upload(): void
    {
        if (! function_exists('imagewebp')) {
            $this->markTestSkipped('GD WebP support is required to generate a fake WebP upload.');
        }

        Storage::fake('assets');
        config(['scrapbook.assets.disk' => 'assets']);

        $admin = $this->userWithRole('admin');
        $category = AssetCategory::factory()->create(['name' => 'Papéis', 'slug' => 'papeis']);

        Livewire::actingAs($admin)
            ->test(CreateAsset::class)
            ->fillForm($this->assetFormData($category, UploadedFile::fake()->image('paper.webp', 80, 60), [
                'name' => 'Papel real',
                'slug' => 'papel-real',
                'type' => AssetType::Paper->value,
            ]))
            ->call('create')
            ->assertHasNoFormErrors();

        $asset = Asset::query()->where('slug', 'papel-real')->firstOrFail();

        $this->assertSame('image/webp', $asset->mime_type);
        $this->assertSame(80, $asset->width);
        $this->assertSame(60, $asset->height);
        $this->assertSame('paper', $asset->metadata['renderStyle']);

        Storage::disk('assets')->assertExists($asset->storage_path);
    }

    public function test_invalid_upload_and_svg_upload_are_rejected(): void
    {
        Storage::fake('assets');
        config(['scrapbook.assets.disk' => 'assets']);

        $admin = $this->userWithRole('admin');
        $category = AssetCategory::factory()->create();

        Livewire::actingAs($admin)
            ->test(CreateAsset::class)
            ->fillForm($this->assetFormData($category, UploadedFile::fake()->create('asset.txt', 1, 'text/plain')))
            ->call('create')
            ->assertHasFormErrors(['asset_file']);

        Livewire::actingAs($admin)
            ->test(CreateAsset::class)
            ->fillForm($this->assetFormData($category, UploadedFile::fake()->createWithContent('asset.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')->mimeType('image/svg+xml')))
            ->call('create')
            ->assertHasFormErrors(['asset_file']);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function assetFormData(AssetCategory $category, UploadedFile $file, array $overrides = []): array
    {
        return [
            'asset_file' => $file,
            'asset_category_id' => $category->id,
            'name' => 'Coração real',
            'slug' => 'coracao-real',
            'type' => AssetType::Sticker->value,
            'is_active' => true,
            'sort_order' => 10,
            'metadata' => json_encode([
                'schemaVersion' => 1,
                'renderStyle' => 'sticker',
                'physical' => [
                    'whiteBorder' => true,
                    'borderWidth' => 8,
                    'dropShadow' => true,
                    'shadowIntensity' => 'medium',
                    'lift' => 8,
                    'paperTexture' => true,
                    'slightRotation' => true,
                    'edgeHighlight' => true,
                ],
                'defaultTransform' => [
                    'w' => 220,
                    'h' => 220,
                    'rotation' => -4,
                ],
            ], JSON_THROW_ON_ERROR),
            ...$overrides,
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
