<?php

namespace Tests\Feature;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GiftMediaTest extends TestCase
{
    use RefreshDatabase;

    private string $mediaDisk = 'media-test';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('scrapbook.media.disk', $this->mediaDisk);
        config()->set('scrapbook.media.max_upload_kb', 5120);
        config()->set('scrapbook.media.max_images_per_gift', 8);
        config()->set('scrapbook.media.max_storage_mb', 50);
        Storage::fake($this->mediaDisk);
    }

    public function test_authenticated_user_can_upload_image_to_own_draft_gift(): void
    {
        if (! extension_loaded('gd')) {
            $this->markTestSkipped('A extensão GD é necessária para processar imagens com o driver local.');
        }

        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => $this->fakePng()->size(300),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'image')
            ->assertJsonPath('data.status', MediaStatus::Processed->value);

        $mediaItem = MediaItem::query()->firstOrFail();

        $this->assertSame($user->id, $mediaItem->user_id);
        $this->assertSame($gift->id, $mediaItem->gift_id);
        $this->assertSame(MediaType::Image, $mediaItem->type);
        $this->assertSame(MediaStatus::Processed, $mediaItem->status);
        $this->assertSame('image/webp', $mediaItem->mime_type);
        $this->assertNotNull($mediaItem->width);
        $this->assertNotNull($mediaItem->height);
        Storage::disk($this->mediaDisk)->assertExists($mediaItem->storage_path);
        Storage::disk($this->mediaDisk)->assertExists(data_get($mediaItem->variants, 'thumbnail.storage_path'));
    }

    public function test_guest_cannot_upload_image(): void
    {
        $gift = Gift::factory()->create();

        $this
            ->post(route('app.gifts.media.store', $gift), [
                'image' => $this->fakePng(),
            ])
            ->assertRedirect(route('login'));
    }

    public function test_user_cannot_upload_image_to_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => $this->fakePng(),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    public function test_published_gift_does_not_accept_upload(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => $this->fakePng(),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    public function test_upload_rejects_non_image_file(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => UploadedFile::fake()->create('notes.txt', 1, 'text/plain'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');
    }

    public function test_upload_rejects_svg(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => UploadedFile::fake()->create('photo.svg', 1, 'image/svg+xml'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');
    }

    public function test_upload_respects_max_file_size(): void
    {
        config()->set('scrapbook.media.max_upload_kb', 5);

        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.media.store', $gift), [
                'image' => $this->fakePng()->size(6),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('image');
    }

    public function test_user_lists_only_media_from_requested_own_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $otherGift = Gift::factory()->create(['user_id' => $user->id]);
        $ownMedia = MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
        ]);
        MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $otherGift->id,
        ]);
        MediaItem::factory()->processed()->create();

        $this
            ->actingAs($user)
            ->getJson(route('app.gifts.media.index', $gift))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownMedia->id);
    }

    public function test_user_cannot_use_media_from_another_gift_in_canvas(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $otherGift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $otherGift->id,
        ]);

        $this
            ->actingAs($user)
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    ['id' => 'photo_1', 'type' => 'image', 'mediaItemId' => $mediaItem->id, 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 100, 'z' => 1],
                ]),
            ])
            ->assertForbidden();
    }

    public function test_user_cannot_use_media_from_another_user_in_canvas(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $otherGift = Gift::factory()->create(['user_id' => $otherUser->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $otherUser->id,
            'gift_id' => $otherGift->id,
        ]);

        $this
            ->actingAs($user)
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    ['id' => 'photo_1', 'type' => 'image', 'mediaItemId' => $mediaItem->id, 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 100, 'z' => 1],
                ]),
            ])
            ->assertForbidden();
    }

    public function test_canvas_with_arbitrary_relative_image_src_is_rejected(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.edit', $gift))
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    ['id' => 'photo_1', 'type' => 'image', 'src' => '/storage/photo.webp', 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 100, 'z' => 1],
                ]),
            ])
            ->assertRedirect(route('app.gifts.edit', $gift))
            ->assertSessionHasErrors('canvas.media');
    }

    public function test_valid_media_item_can_be_saved_in_image_element_canvas(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
        ]);

        $this
            ->actingAs($user)
            ->patch(route('app.gifts.pages.update', [$gift, $page]), [
                'canvas' => $this->canvas([
                    ['id' => 'photo_1', 'type' => 'image', 'mediaItemId' => $mediaItem->id, 'x' => 0, 'y' => 0, 'w' => 100, 'h' => 100, 'z' => 1],
                ]),
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $element = $page->refresh()->canvas['elements'][0];

        $this->assertSame($mediaItem->id, $element['mediaItemId']);
        $this->assertSame(route('app.gifts.media.show', [$gift, $mediaItem], false), $element['src']);
    }

    public function test_user_can_soft_delete_own_gift_media(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
        ]);

        $this
            ->actingAs($user)
            ->deleteJson(route('app.gifts.media.destroy', [$gift, $mediaItem]))
            ->assertOk()
            ->assertJsonPath('deleted', true);

        $deletedMedia = MediaItem::withTrashed()->findOrFail($mediaItem->id);

        $this->assertSame(MediaStatus::Deleted, $deletedMedia->status);
        $this->assertNotNull($deletedMedia->deleted_at);
    }

    /**
     * @param  array<int, array<string, mixed>>  $elements
     * @return array<string, mixed>
     */
    private function canvas(array $elements): array
    {
        return [
            'schemaVersion' => 1,
            'artboard' => ['width' => 390, 'height' => 844],
            'elements' => $elements,
        ];
    }

    private function fakePng(string $name = 'foto.png'): UploadedFile
    {
        $png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            true,
        );

        $file = UploadedFile::fake()->createWithContent($name, $png !== false ? $png : '');

        return $file->mimeType('image/png');
    }
}
