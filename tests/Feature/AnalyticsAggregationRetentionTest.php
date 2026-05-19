<?php

namespace Tests\Feature;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsDailyMetric;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Analytics\Services\AnalyticsMetricWriter;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Templates\Models\TemplateVersion;
use App\Filament\Pages\AnalyticsOverview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AnalyticsAggregationRetentionTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_aggregate_command_aggregates_yesterday_by_default(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $date = Carbon::parse('2026-05-18 10:00:00');

        AnalyticsSession::query()->create([
            'session_uuid' => (string) Str::uuid(),
            'first_seen_at' => $date,
            'last_seen_at' => $date,
            'device_type' => 'mobile',
        ]);
        $this->event(AnalyticsEventName::UserRegistered, $date);

        $this->artisan('scrapbook:analytics-aggregate')
            ->assertExitCode(0);

        $this->assertSame(1, $this->metric('2026-05-18', 'sessions_total'));
        $this->assertSame(1, $this->metric('2026-05-18', 'users_registered'));
        $this->assertSame(1, $this->metric('2026-05-18', 'sessions_total', ['device_type' => 'mobile']));
    }

    public function test_aggregate_command_accepts_specific_date(): void
    {
        $date = Carbon::parse('2026-05-10 09:00:00');

        $this->event(AnalyticsEventName::EditorOpened, $date);

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-10')
            ->assertExitCode(0);

        $this->assertSame(1, $this->metric('2026-05-10', 'editor_opened'));
        $this->assertSame(0, $this->metric('2026-05-10', 'preview_opened'));
    }

    public function test_force_recalculates_without_duplicating_metrics(): void
    {
        $date = Carbon::parse('2026-05-11 09:00:00');

        $this->event(AnalyticsEventName::EditorOpened, $date);
        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-11')->assertExitCode(0);
        $metricsCount = AnalyticsDailyMetric::query()->whereDate('date', '2026-05-11')->count();

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-11')->assertExitCode(0);
        $this->assertSame($metricsCount, AnalyticsDailyMetric::query()->whereDate('date', '2026-05-11')->count());

        $this->event(AnalyticsEventName::EditorOpened, $date->copy()->addHour());
        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-11 --force')->assertExitCode(0);

        $this->assertSame(2, $this->metric('2026-05-11', 'editor_opened'));
        $this->assertSame($metricsCount, AnalyticsDailyMetric::query()->whereDate('date', '2026-05-11')->count());
    }

    public function test_financial_metrics_use_integer_cents(): void
    {
        $date = Carbon::parse('2026-05-12 10:00:00');
        $order = Order::factory()->create([
            'status' => OrderStatus::Paid->value,
            'amount_cents' => 1299,
            'paid_at' => $date,
            'created_at' => $date,
        ]);

        Payment::factory()->create([
            'order_id' => $order->id,
            'status' => PaymentStatus::Approved->value,
            'amount_cents' => 1299,
            'processed_at' => $date,
            'created_at' => $date,
        ]);

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-12')->assertExitCode(0);

        $this->assertSame(1299, $this->metric('2026-05-12', 'revenue_approved_cents'));
        $this->assertSame(1299, $this->metric('2026-05-12', 'average_ticket_cents'));
        $this->assertSame(1, $this->metric('2026-05-12', 'orders_paid'));
        $this->assertSame(1, $this->metric('2026-05-12', 'payments_approved'));
    }

    public function test_viewer_metrics_are_aggregated(): void
    {
        $date = Carbon::parse('2026-05-13 11:00:00');
        $gift = Gift::factory()->published()->create();
        $visit = GiftVisit::query()->create([
            'gift_id' => $gift->id,
            'visit_uuid' => (string) Str::uuid(),
            'public_source' => 'qr',
            'device_type' => 'mobile',
            'opened_at' => $date,
        ]);

        $this->giftEvent($gift, AnalyticsEventName::GiftPageViewed, $date, ['gift_visit_id' => $visit->id]);
        $this->giftEvent($gift, AnalyticsEventName::EnvelopeOpened, $date, ['gift_visit_id' => $visit->id]);
        $this->giftEvent($gift, AnalyticsEventName::PolaroidFlipped, $date, ['gift_visit_id' => $visit->id]);
        $this->giftEvent($gift, AnalyticsEventName::CreateMyOwnClicked, $date, ['gift_visit_id' => $visit->id]);

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-13')->assertExitCode(0);

        $this->assertSame(1, $this->metric('2026-05-13', 'public_gift_opened'));
        $this->assertSame(1, $this->metric('2026-05-13', 'public_gift_opened', ['source' => 'qr']));
        $this->assertSame(1, $this->metric('2026-05-13', 'gift_page_viewed'));
        $this->assertSame(1, $this->metric('2026-05-13', 'envelope_opened'));
        $this->assertSame(1, $this->metric('2026-05-13', 'polaroid_flipped'));
        $this->assertSame(1, $this->metric('2026-05-13', 'create_my_own_clicked'));
    }

    public function test_funnel_metrics_are_aggregated(): void
    {
        $date = Carbon::parse('2026-05-14 08:00:00');

        foreach ([
            AnalyticsEventName::LandingViewed,
            AnalyticsEventName::CreateFlowStarted,
            AnalyticsEventName::OccasionSelected,
            AnalyticsEventName::TemplateSelected,
            AnalyticsEventName::GiftDraftCreated,
            AnalyticsEventName::EditorOpened,
            AnalyticsEventName::ReviewOpened,
            AnalyticsEventName::CheckoutOpened,
            AnalyticsEventName::OrderCreated,
            AnalyticsEventName::PaymentApproved,
            AnalyticsEventName::GiftPublished,
            AnalyticsEventName::PublicGiftOpened,
        ] as $event) {
            $this->event($event, $date);
        }

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-14')->assertExitCode(0);

        $this->assertSame(1, $this->metric('2026-05-14', 'funnel_landing_viewed'));
        $this->assertSame(1, $this->metric('2026-05-14', 'funnel_checkout_opened'));
        $this->assertSame(1, $this->metric('2026-05-14', 'funnel_payment_approved'));
        $this->assertSame(1, $this->metric('2026-05-14', 'funnel_public_gift_opened'));
    }

    public function test_dimensions_are_stored_consistently(): void
    {
        $date = Carbon::parse('2026-05-15 08:00:00');
        $templateVersion = TemplateVersion::factory()->published()->create();

        $this->event(AnalyticsEventName::TemplateSelected, $date, [
            'template_version_id' => $templateVersion->id,
        ]);

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-15')->assertExitCode(0);

        $metric = $this->metricModel('2026-05-15', 'templates_selected', [
            'template_version_id' => $templateVersion->id,
        ]);

        $this->assertSame(['template_version_id' => $templateVersion->id], $metric->dimensions);
        $this->assertSame(
            app(AnalyticsMetricWriter::class)->dimensionsHash(['template_version_id' => $templateVersion->id]),
            $metric->dimensions_hash,
        );
        $this->assertSame(1, (int) $metric->value_numeric);
    }

    public function test_prune_dry_run_does_not_delete_anything(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $this->configureShortRetention();
        $old = Carbon::now()->subDays(30);
        $gift = Gift::factory()->published()->create();

        $event = $this->event(AnalyticsEventName::EditorOpened, $old);
        $session = AnalyticsSession::query()->create([
            'session_uuid' => (string) Str::uuid(),
            'first_seen_at' => $old,
            'last_seen_at' => $old,
        ]);
        $visit = GiftVisit::query()->create([
            'gift_id' => $gift->id,
            'visit_uuid' => (string) Str::uuid(),
            'opened_at' => $old,
        ]);
        $giftEvent = $this->giftEvent($gift, AnalyticsEventName::GiftPageViewed, $old, ['gift_visit_id' => $visit->id]);
        app(AnalyticsMetricWriter::class)->write($old->toDateString(), 'sessions_total', 1);

        $this->artisan('scrapbook:analytics-prune --dry-run')->assertExitCode(0);

        $this->assertTrue(AnalyticsEvent::query()->whereKey($event->id)->exists());
        $this->assertTrue(AnalyticsSession::query()->whereKey($session->id)->exists());
        $this->assertTrue(GiftVisit::query()->whereKey($visit->id)->exists());
        $this->assertTrue(GiftEvent::query()->whereKey($giftEvent->id)->exists());
        $this->assertSame(1, AnalyticsDailyMetric::query()->count());
    }

    public function test_prune_removes_old_analytics_records_by_retention(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $this->configureShortRetention();
        $old = Carbon::now()->subDays(30);
        $recent = Carbon::now()->subDays(2);
        $gift = Gift::factory()->published()->create();

        $oldEvent = $this->event(AnalyticsEventName::EditorOpened, $old);
        $recentEvent = $this->event(AnalyticsEventName::EditorOpened, $recent);
        $oldSession = AnalyticsSession::query()->create([
            'session_uuid' => (string) Str::uuid(),
            'first_seen_at' => $old,
            'last_seen_at' => $old,
        ]);
        $recentSession = AnalyticsSession::query()->create([
            'session_uuid' => (string) Str::uuid(),
            'first_seen_at' => $recent,
            'last_seen_at' => $recent,
        ]);
        $oldVisit = GiftVisit::query()->create([
            'gift_id' => $gift->id,
            'visit_uuid' => (string) Str::uuid(),
            'opened_at' => $old,
        ]);
        $oldGiftEvent = $this->giftEvent($gift, AnalyticsEventName::GiftPageViewed, $old, ['gift_visit_id' => $oldVisit->id]);

        $this->artisan('scrapbook:analytics-prune --force')->assertExitCode(0);

        $this->assertFalse(AnalyticsEvent::query()->whereKey($oldEvent->id)->exists());
        $this->assertTrue(AnalyticsEvent::query()->whereKey($recentEvent->id)->exists());
        $this->assertFalse(AnalyticsSession::query()->whereKey($oldSession->id)->exists());
        $this->assertTrue(AnalyticsSession::query()->whereKey($recentSession->id)->exists());
        $this->assertFalse(GiftVisit::query()->whereKey($oldVisit->id)->exists());
        $this->assertFalse(GiftEvent::query()->whereKey($oldGiftEvent->id)->exists());
    }

    public function test_prune_preserves_financial_events_when_configured(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $this->configureShortRetention();
        config()->set('scrapbook.analytics.keep_financial_events_forever', true);
        $old = Carbon::now()->subDays(30);
        $order = Order::factory()->create(['created_at' => $old]);
        $payment = Payment::factory()->create(['order_id' => $order->id, 'created_at' => $old]);

        $normalEvent = $this->event(AnalyticsEventName::EditorOpened, $old);
        $orderEvent = $this->event(AnalyticsEventName::OrderCreated, $old, ['order_id' => $order->id]);
        $paymentEvent = $this->event(AnalyticsEventName::PaymentApproved, $old, ['payment_id' => $payment->id]);

        $this->artisan('scrapbook:analytics-prune --force')->assertExitCode(0);

        $this->assertFalse(AnalyticsEvent::query()->whereKey($normalEvent->id)->exists());
        $this->assertTrue(AnalyticsEvent::query()->whereKey($orderEvent->id)->exists());
        $this->assertTrue(AnalyticsEvent::query()->whereKey($paymentEvent->id)->exists());
    }

    public function test_prune_never_deletes_orders_payments_or_gifts(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $this->configureShortRetention();
        $old = Carbon::now()->subDays(30);
        $gift = Gift::factory()->published()->create(['created_at' => $old]);
        $order = Order::factory()->create(['gift_id' => $gift->id, 'created_at' => $old]);
        $payment = Payment::factory()->create(['order_id' => $order->id, 'created_at' => $old]);

        $this->event(AnalyticsEventName::EditorOpened, $old, ['gift_id' => $gift->id]);
        $this->artisan('scrapbook:analytics-prune --force')->assertExitCode(0);

        $this->assertTrue(Gift::query()->whereKey($gift->id)->exists());
        $this->assertTrue(Order::query()->whereKey($order->id)->exists());
        $this->assertTrue(Payment::query()->whereKey($payment->id)->exists());
    }

    public function test_dashboard_opens_after_aggregation(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');
        $admin = $this->userWithRole('admin');
        $this->event(AnalyticsEventName::LandingViewed, Carbon::parse('2026-05-18 08:00:00'));

        $this->artisan('scrapbook:analytics-aggregate --date=2026-05-18')->assertExitCode(0);

        $this->actingAs($admin)
            ->get(AnalyticsOverview::getUrl())
            ->assertOk()
            ->assertSee('Lucro bruto');
    }

    public function test_console_commands_and_scheduler_can_be_listed(): void
    {
        $this->artisan('list')
            ->assertExitCode(0);

        $this->artisan('schedule:list')
            ->assertExitCode(0);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function event(AnalyticsEventName $eventName, Carbon $occurredAt, array $attributes = []): AnalyticsEvent
    {
        return AnalyticsEvent::query()->create([
            'event_name' => $eventName->value,
            'event_group' => $eventName->group()->value,
            'occurred_at' => $occurredAt,
            'source' => 'server',
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function giftEvent(Gift $gift, AnalyticsEventName $eventName, Carbon $occurredAt, array $attributes = []): GiftEvent
    {
        return GiftEvent::query()->create([
            'gift_id' => $gift->id,
            'event_name' => $eventName->value,
            'event_type' => $eventName->value,
            'occurred_at' => $occurredAt,
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $dimensions
     */
    private function metric(string $date, string $metricKey, array $dimensions = []): int
    {
        return (int) $this->metricModel($date, $metricKey, $dimensions)->value_numeric;
    }

    /**
     * @param  array<string, mixed>  $dimensions
     */
    private function metricModel(string $date, string $metricKey, array $dimensions = []): AnalyticsDailyMetric
    {
        $dimensionsHash = app(AnalyticsMetricWriter::class)->dimensionsHash($dimensions);

        return AnalyticsDailyMetric::query()
            ->whereDate('date', $date)
            ->where('metric_key', $metricKey)
            ->where('dimensions_hash', $dimensionsHash)
            ->firstOrFail();
    }

    private function configureShortRetention(): void
    {
        config()->set('scrapbook.analytics.events_retention_days', 10);
        config()->set('scrapbook.analytics.sessions_retention_days', 10);
        config()->set('scrapbook.analytics.gift_visits_retention_days', 10);
        config()->set('scrapbook.analytics.gift_events_retention_days', 10);
        config()->set('scrapbook.analytics.daily_metrics_retention_days', 10);
        config()->set('scrapbook.analytics.keep_financial_events_forever', true);
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::findOrCreate($roleName, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
