<?php

namespace Tests\Feature;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Analytics\Services\AnalyticsMetrics;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Payments\Actions\CreateCheckoutOrder;
use App\Domain\Payments\Actions\ProcessApprovedPayment;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Plan;
use App\Filament\Pages\AnalyticsOverview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AnalyticsTrackingTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_request_creates_safe_analytics_session(): void
    {
        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->withHeader('User-Agent', 'Analytics Test Agent')
            ->get('/')
            ->assertOk()
            ->assertCookie('scrapbook_visitor');

        $session = AnalyticsSession::query()->firstOrFail();

        $this->assertNull($session->user_id);
        $this->assertSame('/', $session->entry_path);
        $this->assertNotSame('203.0.113.10', $session->ip_hash);
        $this->assertSame(64, strlen((string) $session->ip_hash));
        $this->assertNotSame('Analytics Test Agent', $session->user_agent_hash);
        $this->assertSame(64, strlen((string) $session->user_agent_hash));
    }

    public function test_session_is_associated_to_user_after_login(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->get('/');
        $response->assertOk();
        $session = AnalyticsSession::query()->firstOrFail();
        $visitorCookie = $response->getCookie('scrapbook_visitor')?->getValue();
        $this->assertNotNull($visitorCookie);
        $this->assertSame($session->session_uuid, $visitorCookie);

        $this
            ->withUnencryptedCookie('scrapbook_visitor', (string) $visitorCookie)
            ->post(route('login.store'), [
                'email' => $user->email,
                'password' => 'password',
            ])
            ->assertRedirect();

        $this->assertAuthenticatedAs($user);

        $this->assertTrue(AnalyticsSession::query()->where('user_id', $user->id)->exists());
        $this->assertDatabaseHas('analytics_events', [
            'event_name' => AnalyticsEventName::UserLoggedIn->value,
            'user_id' => $user->id,
        ]);
    }

    public function test_tracker_creates_event_and_sanitizes_sensitive_payload(): void
    {
        app(AnalyticsTracker::class)->track(AnalyticsEventName::AutosaveError, [], [
            'ip' => '203.0.113.99',
            'user_agent' => 'Raw UA',
            'storage_path' => 'private/file.webp',
            'text' => 'mensagem pessoal',
            'safe_count' => 3,
        ]);

        $event = AnalyticsEvent::query()->firstOrFail();

        $this->assertSame(AnalyticsEventName::AutosaveError->value, $event->event_name);
        $this->assertSame(['safe_count' => 3], $event->payload);
    }

    public function test_public_gift_open_creates_visit_and_public_open_event_with_qr_source(): void
    {
        $gift = $this->publishedGift();

        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.25'])
            ->withHeader('User-Agent', 'Viewer Test Agent')
            ->get($this->publicUrl($gift).'?src=qr')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('gift.analytics.enabled', true)
                ->where('gift.analytics.event_url', route('analytics.events', [], false))
                ->has('gift.analytics.visit_uuid'));

        $visit = GiftVisit::query()->where('gift_id', $gift->id)->firstOrFail();

        $this->assertSame('qr', $visit->public_source);
        $this->assertNotSame('203.0.113.25', $visit->ip_hash);
        $this->assertNotSame('Viewer Test Agent', $visit->user_agent_hash);

        $this->assertDatabaseHas('analytics_events', [
            'event_name' => AnalyticsEventName::PublicGiftOpened->value,
            'gift_id' => $gift->id,
            'source' => 'viewer',
            'path' => '/p/{slugToken}',
        ]);
    }

    public function test_client_viewer_events_create_gift_events_and_dedupe_page_view(): void
    {
        $gift = $this->publishedGift();
        $this->get($this->publicUrl($gift))->assertOk();
        $visit = GiftVisit::query()->where('gift_id', $gift->id)->firstOrFail();

        $payload = [
            'event_name' => AnalyticsEventName::GiftPageViewed->value,
            'visit_uuid' => $visit->visit_uuid,
            'page_index' => 0,
            'page_id' => 'page-1',
            'payload' => [
                'text' => 'não deve gravar',
                'book_mode' => 'single',
            ],
        ];

        $this->postJson(route('analytics.events'), $payload)->assertStatus(202);
        $this->postJson(route('analytics.events'), $payload)->assertStatus(202);

        $this->assertSame(1, GiftEvent::query()->where('event_name', AnalyticsEventName::GiftPageViewed->value)->count());
        $this->assertSame(1, $visit->refresh()->page_views_count);

        $this->postJson(route('analytics.events'), [
            'event_name' => AnalyticsEventName::EnvelopeOpened->value,
            'visit_uuid' => $visit->visit_uuid,
            'element_id' => 'env-1',
            'element_type' => 'interactive_envelope',
        ])->assertStatus(202);

        $this->postJson(route('analytics.events'), [
            'event_name' => AnalyticsEventName::PolaroidFlipped->value,
            'visit_uuid' => $visit->visit_uuid,
            'element_id' => 'pol-1',
            'element_type' => 'flip_polaroid',
        ])->assertStatus(202);

        $this->assertDatabaseHas('gift_events', [
            'gift_id' => $gift->id,
            'event_name' => AnalyticsEventName::EnvelopeOpened->value,
            'element_type' => 'interactive_envelope',
        ]);
        $this->assertSame(2, $visit->refresh()->interactions_count);
    }

    public function test_order_and_approved_payment_feed_financial_metrics(): void
    {
        [$user, $gift, $plan] = $this->validGift(['price_cents' => 1299]);

        $order = app(CreateCheckoutOrder::class)->handle($user, $gift, $plan);
        app(ProcessApprovedPayment::class)->handle($order, ['source' => 'test']);

        $this->assertSame(OrderStatus::Paid, $order->refresh()->status);
        $this->assertDatabaseHas('analytics_events', ['event_name' => AnalyticsEventName::OrderCreated->value, 'order_id' => $order->id]);
        $this->assertDatabaseHas('analytics_events', ['event_name' => AnalyticsEventName::PaymentApproved->value, 'order_id' => $order->id]);
        $this->assertDatabaseHas('analytics_events', ['event_name' => AnalyticsEventName::GiftPublished->value, 'gift_id' => $gift->id]);

        $dashboard = app(AnalyticsMetrics::class)->adminDashboard();

        $this->assertSame(1299, $dashboard['revenue']['total_cents']);
        $this->assertSame(1299, $dashboard['revenue']['average_ticket_cents']);
    }

    public function test_only_admin_can_access_global_analytics_dashboard(): void
    {
        $admin = $this->userWithRole('admin');
        $support = $this->userWithRole('support');
        $customer = $this->userWithRole('customer');

        $this->actingAs($admin)->get(AnalyticsOverview::getUrl())->assertOk()->assertSee('Analytics e Observabilidade');
        $this->actingAs($support)->get(AnalyticsOverview::getUrl())->assertForbidden();
        $this->actingAs($customer)->get(AnalyticsOverview::getUrl())->assertForbidden();
    }

    public function test_gift_owner_can_see_only_own_gift_analytics(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $gift = Gift::factory()->published()->create(['user_id' => $owner->id]);
        GiftPage::factory()->create(['gift_id' => $gift->id, 'source_template_page_id' => null]);

        GiftVisit::query()->create([
            'gift_id' => $gift->id,
            'visit_uuid' => (string) Str::uuid(),
            'public_source' => 'qr',
            'opened_at' => now(),
        ]);

        $this
            ->actingAs($owner)
            ->get(route('app.gifts.analytics', $gift))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('gifts/Analytics/GiftAnalytics', false)
                ->where('gift.id', $gift->id)
                ->where('analytics.total_views', 1)
                ->where('analytics.sources.qr', 1));

        $this
            ->actingAs($otherUser)
            ->get(route('app.gifts.analytics', $gift))
            ->assertForbidden();
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

    private function publishedGift(): Gift
    {
        $gift = Gift::factory()->published()->create();
        GiftPage::factory()->create([
            'gift_id' => $gift->id,
            'source_template_page_id' => null,
            'name' => 'Capa',
        ]);

        return $gift;
    }

    private function publicUrl(Gift $gift): string
    {
        return route('public.gifts.show', $gift->slug.'-'.$gift->public_code);
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::findOrCreate($roleName, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
