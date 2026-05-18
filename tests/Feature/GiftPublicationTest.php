<?php

namespace Tests\Feature;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GiftPublicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_open_publication_review_for_own_gift(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Capa',
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.review', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Review/GiftReview', false)
                ->where('gift.id', $gift->id)
                ->where('gift.can_checkout', true)
                ->where('gift.can_publish', false)
                ->has('gift.checks')
                ->where('gift.urls.checkout', route('app.gifts.checkout', $gift, false)));
    }

    public function test_user_cannot_open_publication_review_for_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.review', $gift))
            ->assertForbidden();
    }

    public function test_guest_cannot_open_publication_review(): void
    {
        $gift = Gift::factory()->create();

        $this
            ->get(route('app.gifts.review', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_direct_publication_without_paid_order_redirects_to_checkout(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $user->id]);
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.publish', $gift))
            ->assertRedirect(route('app.gifts.checkout', $gift));

        $this->assertSame(GiftStatus::Draft, $gift->refresh()->status);
    }

    public function test_paid_order_allows_publication_and_generates_public_identifiers(): void
    {
        $publishedAt = Carbon::parse('2026-05-18 12:00:00');
        Carbon::setTestNow($publishedAt);

        try {
            $user = User::factory()->create();
            $plan = Plan::factory()->create(['gift_lifetime_days' => 90]);
            $gift = Gift::factory()->create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'title' => 'Meu presente lindo',
                'slug' => null,
                'public_code' => 'short',
                'published_at' => null,
                'expires_at' => null,
            ]);
            GiftPage::factory()->create([
                'gift_id' => $gift->id,
                'source_template_page_id' => null,
                'name' => 'Capa',
            ]);
            Order::factory()->paid()->create([
                'user_id' => $user->id,
                'gift_id' => $gift->id,
                'plan_id' => $plan->id,
            ]);

            $this
                ->actingAs($user)
                ->post(route('app.gifts.publish', $gift))
                ->assertRedirect(route('app.gifts.review', $gift))
                ->assertSessionHasNoErrors();
        } finally {
            Carbon::setTestNow();
        }

        $gift->refresh();

        $this->assertSame(GiftStatus::Published, $gift->status);
        $this->assertSame(GiftVisibility::PublicLink, $gift->visibility);
        $this->assertSame('meu-presente-lindo', $gift->slug);
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]{32}$/', (string) $gift->public_code);
        $this->assertTrue($gift->published_at?->equalTo($publishedAt));
        $this->assertTrue($gift->expires_at?->equalTo($publishedAt->copy()->addDays(90)));
    }

    public function test_user_cannot_publish_another_users_gift(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->create(['user_id' => $owner->id]);
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
        ]);

        $this
            ->actingAs($otherUser)
            ->post(route('app.gifts.publish', $gift))
            ->assertForbidden();

        $this->assertSame(GiftStatus::Draft, $gift->refresh()->status);
    }

    public function test_published_gift_public_url_appears_in_dashboard(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $user->id]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gifts.0.id', $gift->id)
                ->where('gifts.0.public_url', route('public.gifts.show', $gift->slug.'-'.$gift->public_code)));
    }

    public function test_pending_payment_gift_shows_order_cta_in_dashboard(): void
    {
        $user = User::factory()->create();
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'status' => GiftStatus::PendingPayment,
        ]);
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'gift_id' => $gift->id,
            'status' => OrderStatus::Pending,
        ]);

        $this
            ->actingAs($user)
            ->get(route('app.gifts.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gifts.0.id', $gift->id)
                ->where('gifts.0.status', GiftStatus::PendingPayment->value)
                ->where('gifts.0.order_url', route('app.orders.show', $order)));
    }

    public function test_slug_without_public_code_still_does_not_access_after_review_routes_exist(): void
    {
        $gift = Gift::factory()->published()->create();

        $this
            ->get('/p/'.$gift->slug)
            ->assertNotFound();
    }
}
