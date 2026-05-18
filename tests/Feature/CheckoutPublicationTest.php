<?php

namespace Tests\Feature;

use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Actions\CreateCheckoutOrder;
use App\Domain\Payments\Actions\ProcessApprovedPayment;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutPublicationTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_access_checkout_for_valid_own_gift(): void
    {
        [$user, $gift, $plan] = $this->validGift();

        $this
            ->actingAs($user)
            ->get(route('app.gifts.checkout', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('payments/Checkout/CheckoutShow', false)
                ->where('gift.id', $gift->id)
                ->where('plan.id', $plan->id)
                ->where('can_checkout', true));
    }

    public function test_user_cannot_access_checkout_for_another_users_gift(): void
    {
        [$owner, $gift] = $this->validGift();
        $otherUser = User::factory()->create();

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.checkout', $gift))
            ->assertForbidden();
    }

    public function test_guest_cannot_access_checkout(): void
    {
        [, $gift] = $this->validGift();

        $this
            ->get(route('app.gifts.checkout', $gift))
            ->assertRedirect(route('login'));
    }

    public function test_gift_without_checklist_approval_does_not_create_order(): void
    {
        [$user, $gift] = $this->validGift();
        $gift->pages()->update(['is_visible' => false]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.checkout', $gift))
            ->post(route('app.gifts.checkout.store', $gift))
            ->assertRedirect(route('app.gifts.checkout', $gift))
            ->assertSessionHasErrors('visible_pages');

        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(GiftStatus::Draft, $gift->refresh()->status);
    }

    public function test_gift_with_external_canvas_url_does_not_create_order(): void
    {
        [$user, $gift] = $this->validGift();
        $gift->pages()->firstOrFail()->update([
            'canvas' => $this->canvas([
                ['id' => 'photo', 'type' => 'image', 'src' => 'https://evil.example/x.jpg', 'x' => 0, 'y' => 0, 'w' => 120, 'h' => 120, 'z' => 1],
            ]),
        ]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.checkout', $gift))
            ->post(route('app.gifts.checkout.store', $gift))
            ->assertRedirect(route('app.gifts.checkout', $gift))
            ->assertSessionHasErrors('media_references');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_gift_with_media_from_another_gift_does_not_create_order(): void
    {
        [$user, $gift] = $this->validGift();
        $otherGift = Gift::factory()->create(['user_id' => $user->id]);
        $otherMedia = MediaItem::factory()->processed()->create([
            'user_id' => $user->id,
            'gift_id' => $otherGift->id,
        ]);

        $gift->pages()->firstOrFail()->update([
            'canvas' => $this->canvas([
                ['id' => 'photo', 'type' => 'image', 'mediaItemId' => $otherMedia->id, 'x' => 0, 'y' => 0, 'w' => 120, 'h' => 120, 'z' => 1],
            ]),
        ]);

        $this
            ->actingAs($user)
            ->from(route('app.gifts.checkout', $gift))
            ->post(route('app.gifts.checkout.store', $gift))
            ->assertRedirect(route('app.gifts.checkout', $gift))
            ->assertSessionHasErrors('media_references');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_creates_pending_order_from_plan_price_and_sets_gift_pending_payment(): void
    {
        [$user, $gift, $plan] = $this->validGift(['price_cents' => 1299]);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.checkout.store', $gift), ['amount_cents' => 1])
            ->assertRedirect();

        $order = Order::query()->firstOrFail();

        $this->assertSame($user->id, $order->user_id);
        $this->assertSame($gift->id, $order->gift_id);
        $this->assertSame($plan->id, $order->plan_id);
        $this->assertSame(OrderStatus::Pending, $order->status);
        $this->assertSame(1299, $order->amount_cents);
        $this->assertSame('BRL', $order->currency);
        $this->assertSame('manual_dev', $order->provider);
        $this->assertSame(GiftStatus::PendingPayment, $gift->refresh()->status);
    }

    public function test_checkout_reuses_existing_pending_order(): void
    {
        [$user, $gift] = $this->validGift();
        $firstOrder = app(CreateCheckoutOrder::class)->handle($user, $gift, $gift->plan);

        $this
            ->actingAs($user)
            ->post(route('app.gifts.checkout.store', $gift))
            ->assertRedirect(route('app.orders.show', $firstOrder));

        $this->assertDatabaseCount('orders', 1);
    }

    public function test_pending_payment_gift_is_not_publicly_accessible(): void
    {
        [$user, $gift] = $this->validGift();
        $gift->forceFill([
            'status' => GiftStatus::PendingPayment,
            'visibility' => GiftVisibility::PublicLink,
            'public_code' => Str::random(32),
        ])->save();

        $this
            ->actingAs($user)
            ->get(route('public.gifts.show', $gift->slug.'-'.$gift->public_code))
            ->assertNotFound();
    }

    public function test_dev_payment_approval_marks_order_paid_creates_payment_and_publishes_gift(): void
    {
        [$user, $gift] = $this->validGift();

        $order = app(CreateCheckoutOrder::class)->handle($user, $gift, $gift->plan);

        $this
            ->actingAs($user)
            ->post(route('app.orders.dev-approve', $order))
            ->assertRedirect(route('app.orders.show', $order));

        $order->refresh();
        $gift->refresh();
        $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();

        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertNotNull($order->paid_at);
        $this->assertSame(PaymentStatus::Approved, $payment->status);
        $this->assertSame($order->amount_cents, $payment->amount_cents);
        $this->assertSame(GiftStatus::Published, $gift->status);
        $this->assertSame(GiftVisibility::PublicLink, $gift->visibility);
        $this->assertNotNull($gift->public_code);
        $this->assertNotNull($gift->published_at);
    }

    public function test_approved_payment_processing_is_idempotent(): void
    {
        [$user, $gift] = $this->validGift();
        $order = app(CreateCheckoutOrder::class)->handle($user, $gift, $gift->plan);
        $processor = app(ProcessApprovedPayment::class);

        $firstPayment = $processor->handle($order, ['source' => 'test']);
        $secondPayment = $processor->handle($order->refresh(), ['source' => 'test-again']);

        $this->assertSame($firstPayment->id, $secondPayment->id);
        $this->assertDatabaseCount('payments', 1);
        $this->assertSame(OrderStatus::Paid, $order->refresh()->status);
        $this->assertSame(GiftStatus::Published, $gift->refresh()->status);
    }

    public function test_public_link_opens_only_after_payment_approval_publishes_gift(): void
    {
        [$user, $gift] = $this->validGift();
        $order = app(CreateCheckoutOrder::class)->handle($user, $gift, $gift->plan);

        $this
            ->get('/p/'.$gift->slug.'-'.($gift->public_code ?? Str::random(32)))
            ->assertNotFound();

        app(ProcessApprovedPayment::class)->handle($order, ['source' => 'test']);

        $gift->refresh();

        $this
            ->get(route('public.gifts.show', $gift->slug.'-'.$gift->public_code))
            ->assertOk();
    }

    public function test_dev_approval_route_is_not_available_in_production(): void
    {
        [$user, $gift] = $this->validGift();
        $order = app(CreateCheckoutOrder::class)->handle($user, $gift, $gift->plan);

        $this->app->detectEnvironment(fn (): string => 'production');
        $this->withoutMiddleware(VerifyCsrfToken::class);

        $this
            ->actingAs($user)
            ->withSession(['_token' => 'test-token'])
            ->post(route('app.orders.dev-approve', $order), ['_token' => 'test-token'])
            ->assertNotFound();
    }

    public function test_review_points_to_checkout_instead_of_direct_publication(): void
    {
        [$user, $gift] = $this->validGift();

        $this
            ->actingAs($user)
            ->get(route('app.gifts.review', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.can_checkout', true)
                ->where('gift.can_publish', false)
                ->where('gift.urls.checkout', route('app.gifts.checkout', $gift, false)));
    }

    /**
     * @param  array<string, mixed>  $planAttributes
     * @return array{0: User, 1: Gift, 2: Plan}
     */
    private function validGift(array $planAttributes = []): array
    {
        $user = User::factory()->create();
        $plan = Plan::factory()->create($planAttributes);
        $gift = Gift::factory()->create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'title' => 'Gift validado',
            'slug' => 'gift-validado',
            'public_code' => null,
        ]);

        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Capa',
        ]);

        return [$user, $gift->refresh(), $plan];
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
}
