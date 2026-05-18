<?php

namespace Tests\Feature;

use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GiftViewerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_open_private_preview_for_own_draft_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        $page = GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Carta',
            'sort_order' => 10,
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.preview', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $pageAssert) => $pageAssert
                ->component('gifts/Preview/GiftPreview', false)
                ->where('gift.id', $gift->id)
                ->where('gift.status', GiftStatus::Draft->value)
                ->where('gift.urls.edit', route('app.gifts.edit', $gift, false))
                ->has('gift.pages', 1)
                ->where('gift.pages.0.id', $page->id));
    }

    public function test_user_cannot_open_private_preview_from_another_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.preview', $gift))
            ->assertForbidden();
    }

    public function test_guest_cannot_open_private_preview(): void
    {
        $gift = Gift::factory()->create();

        $this
            ->get(route('app.gifts.preview', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_draft_gift_is_not_publicly_accessible(): void
    {
        $gift = Gift::factory()->create([
            'public_code' => Str::random(24),
            'visibility' => GiftVisibility::PublicLink,
        ]);

        $this
            ->get($this->publicUrl($gift))
            ->assertNotFound();
    }

    public function test_published_gift_is_accessible_by_slug_and_public_code(): void
    {
        $gift = Gift::factory()->published()->create();
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Capa',
            'sort_order' => 10,
        ]);

        $this
            ->get($this->publicUrl($gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public-gifts/PublicGiftShow', false)
                ->where('gift.title', $gift->title)
                ->where('gift.status', GiftStatus::Published->value)
                ->has('gift.pages', 1));
    }

    public function test_disabled_gift_is_not_publicly_accessible(): void
    {
        $gift = Gift::factory()->disabled()->create();

        $this
            ->get($this->publicUrl($gift))
            ->assertNotFound();
    }

    public function test_expired_gift_is_not_publicly_accessible(): void
    {
        $gift = Gift::factory()->expired()->create();

        $this
            ->get($this->publicUrl($gift))
            ->assertNotFound();
    }

    public function test_slug_without_public_code_does_not_access_public_gift(): void
    {
        $gift = Gift::factory()->published()->create();

        $this
            ->get('/p/'.$gift->slug)
            ->assertNotFound();
    }

    public function test_wrong_public_code_does_not_access_public_gift(): void
    {
        $gift = Gift::factory()->published()->create();

        $this
            ->get('/p/'.$gift->slug.'-'.Str::random(24))
            ->assertNotFound();
    }

    public function test_public_viewer_payload_does_not_expose_owner_or_internal_fields(): void
    {
        $owner = User::factory()->create(['email' => 'dono@example.test']);
        $gift = Gift::factory()->published()->create(['user_id' => $owner->id]);
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->get($this->publicUrl($gift))
            ->assertOk()
            ->assertDontSee($owner->email)
            ->assertInertia(fn (Assert $page) => $page
                ->missing('gift.user_id')
                ->missing('gift.user')
                ->missing('gift.public_code')
                ->missing('gift.plan')
                ->missing('gift.orders')
                ->missing('gift.payments'));
    }

    public function test_public_media_is_served_when_it_belongs_to_accessible_published_gift(): void
    {
        Storage::fake('public');

        $gift = Gift::factory()->published()->create();
        $mediaItem = MediaItem::factory()->processed()->create([
            'gift_id' => $gift->id,
            'user_id' => $gift->user_id,
            'storage_disk' => 'public',
            'storage_path' => 'media/photo.webp',
            'mime_type' => 'image/webp',
        ]);
        Storage::disk('public')->put($mediaItem->storage_path, 'image-bytes');

        $this
            ->get(route('public.gifts.media.show', [$this->slugToken($gift), $mediaItem]))
            ->assertOk();
    }

    public function test_public_media_from_another_gift_is_not_served(): void
    {
        Storage::fake('public');

        $gift = Gift::factory()->published()->create();
        $otherGift = Gift::factory()->published()->create();
        $mediaItem = MediaItem::factory()->processed()->create([
            'gift_id' => $otherGift->id,
            'user_id' => $otherGift->user_id,
            'storage_disk' => 'public',
            'storage_path' => 'media/other.webp',
            'mime_type' => 'image/webp',
        ]);
        Storage::disk('public')->put($mediaItem->storage_path, 'image-bytes');

        $this
            ->get(route('public.gifts.media.show', [$this->slugToken($gift), $mediaItem]))
            ->assertNotFound();
    }

    public function test_media_from_draft_gift_is_not_served_publicly(): void
    {
        Storage::fake('public');

        $gift = Gift::factory()->create([
            'public_code' => Str::random(24),
            'visibility' => GiftVisibility::PublicLink,
        ]);
        $mediaItem = MediaItem::factory()->processed()->create([
            'gift_id' => $gift->id,
            'user_id' => $gift->user_id,
            'storage_disk' => 'public',
            'storage_path' => 'media/draft.webp',
            'mime_type' => 'image/webp',
        ]);
        Storage::disk('public')->put($mediaItem->storage_path, 'image-bytes');

        $this
            ->get(route('public.gifts.media.show', [$this->slugToken($gift), $mediaItem]))
            ->assertNotFound();
    }

    public function test_valid_media_item_id_generates_safe_public_viewer_url_in_canvas(): void
    {
        $gift = Gift::factory()->published()->create();
        $mediaItem = MediaItem::factory()->processed()->create([
            'gift_id' => $gift->id,
            'user_id' => $gift->user_id,
            'storage_path' => 'secret/storage/path.webp',
        ]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([
                [
                    'id' => 'photo',
                    'type' => 'image',
                    'mediaItemId' => $mediaItem->id,
                    'src' => 'https://evil.example/photo.jpg',
                    'x' => 0,
                    'y' => 0,
                    'w' => 120,
                    'h' => 120,
                    'z' => 1,
                ],
            ]),
        ]);

        $this
            ->get($this->publicUrl($gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.pages.0.canvas.elements.0.src', route('public.gifts.media.show', [$this->slugToken($gift), $mediaItem], false))
                ->where('gift.pages.0.canvas.elements.0.mediaItemId', $mediaItem->id)
                ->missing('gift.pages.0.canvas.elements.0.storage_path'));
    }

    public function test_invalid_media_item_id_does_not_generate_external_or_unsafe_canvas_url(): void
    {
        $gift = Gift::factory()->published()->create();
        $otherGift = Gift::factory()->published()->create();
        $mediaItem = MediaItem::factory()->processed()->create([
            'gift_id' => $otherGift->id,
            'user_id' => $otherGift->user_id,
        ]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'canvas' => $this->canvas([
                [
                    'id' => 'photo',
                    'type' => 'image',
                    'mediaItemId' => $mediaItem->id,
                    'src' => 'https://evil.example/photo.jpg',
                    'x' => 0,
                    'y' => 0,
                    'w' => 120,
                    'h' => 120,
                    'z' => 1,
                ],
            ]),
        ]);

        $this
            ->get($this->publicUrl($gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.pages.0.canvas.elements.0.missingMedia', true)
                ->missing('gift.pages.0.canvas.elements.0.src')
                ->missing('gift.pages.0.canvas.elements.0.mediaItemId'));
    }

    public function test_public_visit_is_recorded_without_raw_ip(): void
    {
        $gift = Gift::factory()->published()->create();
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->withHeader('User-Agent', 'Viewer Test Agent')
            ->withHeader('Referer', 'https://example.test/path?token=secret')
            ->get($this->publicUrl($gift))
            ->assertOk();

        $visit = GiftVisit::query()->where('gift_id', $gift->id)->firstOrFail();

        $this->assertNotSame('203.0.113.10', $visit->ip_hash);
        $this->assertSame(64, strlen((string) $visit->ip_hash));
        $this->assertNotSame('Viewer Test Agent', $visit->user_agent_hash);
        $this->assertSame(64, strlen((string) $visit->user_agent_hash));
        $this->assertSame('example.test', $visit->referrer);
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

    private function publicUrl(Gift $gift): string
    {
        return route('public.gifts.show', $this->slugToken($gift));
    }

    private function slugToken(Gift $gift): string
    {
        return $gift->slug.'-'.$gift->public_code;
    }
}
