<?php

namespace Tests\Feature;

use App\Domain\Gifts\Actions\GenerateGiftQrCode;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GiftShareTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_access_share_screen_for_published_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.share', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Share/GiftShare', false)
                ->where('gift.id', $gift->id)
                ->where('share.can_share', true)
                ->where('share.public_url', $this->publicUrl($gift))
                ->where('share.qr_code_url', route('app.gifts.qr-code', $gift, false))
                ->where('share.qr_code_download_url', route('app.gifts.qr-code', $gift, false).'?download=1')
                ->where('share.card_url', route('app.gifts.share-card', $gift, false))
                ->where('share.card_download_url', route('app.gifts.share-card.download', $gift, false)));
    }

    public function test_user_cannot_access_share_screen_for_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.share', $gift))
            ->assertForbidden();
    }

    public function test_user_cannot_access_qr_or_card_for_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.qr-code', $gift))
            ->assertForbidden();

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.share-card', $gift))
            ->assertForbidden();
    }

    public function test_guest_cannot_access_private_share_screen(): void
    {
        $gift = Gift::factory()->published()->create();

        $this
            ->get(route('app.gifts.share', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_draft_gift_does_not_generate_final_qr_code(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'public_code' => Str::random(32),
            'visibility' => GiftVisibility::PublicLink,
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.qr-code', $gift))
            ->assertNotFound();

        $this
            ->actingAs($user)
            ->get(route('app.gifts.share', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('share.can_share', false)
                ->where('share.status_message', 'Publique o presente para gerar QR Code.')
                ->where('share.qr_code_url', null));
    }

    public function test_pending_payment_gift_does_not_generate_final_qr_code(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'public_code' => Str::random(32),
            'status' => GiftStatus::PendingPayment,
            'visibility' => GiftVisibility::PublicLink,
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.qr-code', $gift))
            ->assertNotFound();
    }

    public function test_published_gift_qr_code_points_to_public_url_without_internal_data(): void
    {
        $owner = User::factory()->create(['email' => 'dono@example.test']);
        $gift = Gift::factory()->published()->create(['user_id' => $owner->id]);

        $qrCode = app(GenerateGiftQrCode::class)->handle($gift);

        $this->assertSame($this->publicUrl($gift), $qrCode->payload);
        $this->assertStringStartsWith($this->publicUrl($gift), $qrCode->payload);
        $this->assertStringContainsString('<svg', $qrCode->svg);
        $this->assertStringNotContainsString($owner->id, $qrCode->payload);
        $this->assertStringNotContainsString($owner->email, $qrCode->payload);
        $this->assertStringNotContainsString($owner->email, $qrCode->svg);
        $this->assertStringNotContainsString('user_id', $qrCode->svg);
        $this->assertStringNotContainsString('/app/', $qrCode->svg);

        $this
            ->actingAs($owner)
            ->get(route('app.gifts.qr-code', $gift))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/svg+xml; charset=UTF-8')
            ->assertSee('<svg', false)
            ->assertDontSee($owner->email);
    }

    public function test_disabled_or_expired_gifts_are_not_shareable_as_active_qr_codes(): void
    {
        $user = User::factory()->create();
        $disabledGift = Gift::factory()->disabled()->create(['user_id' => $user->id]);
        $expiredGift = Gift::factory()->expired()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.qr-code', $disabledGift))
            ->assertNotFound();

        $this
            ->actingAs($user)
            ->get(route('app.gifts.qr-code', $expiredGift))
            ->assertNotFound();
    }

    public function test_owner_can_open_share_card_for_published_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create([
            'user_id' => $user->id,
            'recipient_name' => 'Ana',
            'sender_name' => 'João',
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.share-card', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Share/ShareCard', false)
                ->where('card.public_url', $this->publicUrl($gift))
                ->where('card.recipient_name', 'Ana')
                ->where('card.sender_name', 'João')
                ->where('card.qr_code_url', route('app.gifts.qr-code', $gift, false)));
    }

    public function test_dashboard_exposes_share_action_for_published_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gifts.0.id', $gift->id)
                ->where('gifts.0.public_url', $this->publicUrl($gift))
                ->where('gifts.0.share_url', route('app.gifts.share', $gift))
                ->where('gifts.0.qr_code_download_url', route('app.gifts.qr-code', $gift).'?download=1'));
    }

    public function test_wrong_public_code_still_returns_not_found_on_public_viewer(): void
    {
        $gift = Gift::factory()->published()->create();

        $this
            ->get('/p/'.$gift->slug.'-'.Str::random(32))
            ->assertNotFound();
    }

    private function publicUrl(Gift $gift): string
    {
        return route('public.gifts.show', $gift->slug.'-'.$gift->public_code);
    }
}
