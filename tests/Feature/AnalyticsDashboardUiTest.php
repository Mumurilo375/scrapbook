<?php

namespace Tests\Feature;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Filament\Pages\AnalyticsOverview;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AnalyticsDashboardUiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_accesses_dashboard_with_empty_state(): void
    {
        $admin = $this->userWithRole('admin');

        $this
            ->actingAs($admin)
            ->get(AnalyticsOverview::getUrl())
            ->assertOk()
            ->assertSee('Analytics e Observabilidade')
            ->assertSee('Lucro bruto')
            ->assertSee('Pedidos pagos')
            ->assertSee('Ticket médio')
            ->assertSee('Dashboard')
            ->assertSee('Operacional')
            ->assertSee('Funil resumido')
            ->assertSee('Templates')
            ->assertSee('Temas')
            ->assertSee('Ocasiões')
            ->assertSee('Planos');

        Livewire::actingAs($admin)
            ->test(AnalyticsOverview::class)
            ->call('setActiveTab', 'operational')
            ->assertSee('Eventos, ações e logs')
            ->assertSee('Nenhum evento operacional encontrado.')
            ->assertSee('Resumo de saúde')
            ->assertSee('Retenção e prune')
            ->assertSee('php artisan scrapbook:analytics-aggregate')
            ->assertSee('php artisan scrapbook:analytics-prune --dry-run');
    }

    public function test_customer_cannot_access_global_dashboard(): void
    {
        $customer = $this->userWithRole('customer');

        $this
            ->actingAs($customer)
            ->get(AnalyticsOverview::getUrl())
            ->assertForbidden();
    }

    public function test_dashboard_renders_with_data_and_does_not_print_sensitive_payload(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');

        $admin = $this->userWithRole('admin');
        $user = User::factory()->create(['email' => 'buyer@example.test']);
        $plan = Plan::factory()->create(['price_cents' => 1299]);
        $gift = Gift::factory()->published()->create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'title' => 'Gift analytics bonito',
            'published_at' => now(),
        ]);

        Order::factory()
            ->paid()
            ->create([
                'user_id' => $user->id,
                'gift_id' => $gift->id,
                'plan_id' => $plan->id,
                'amount_cents' => 1299,
                'paid_at' => now(),
            ]);

        Payment::factory()
            ->approved()
            ->create([
                'amount_cents' => 1299,
            ]);

        AnalyticsSession::query()->create([
            'session_uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'first_seen_at' => now(),
            'last_seen_at' => now(),
        ]);

        GiftVisit::query()->create([
            'gift_id' => $gift->id,
            'visit_uuid' => (string) Str::uuid(),
            'public_source' => 'qr',
            'opened_at' => now(),
            'completed_at' => now(),
            'page_views_count' => 4,
            'interactions_count' => 2,
        ]);

        $this->event(AnalyticsEventName::CheckoutOpened, ['gift_id' => $gift->id, 'user_id' => $user->id]);
        $this->event(AnalyticsEventName::OrderPaid, ['gift_id' => $gift->id, 'user_id' => $user->id]);
        $this->event(AnalyticsEventName::GiftCompleted, ['gift_id' => $gift->id]);
        $this->event(AnalyticsEventName::EnvelopeOpened, ['gift_id' => $gift->id]);
        $this->event(AnalyticsEventName::PolaroidFlipped, ['gift_id' => $gift->id]);
        $this->event(AnalyticsEventName::CreateMyOwnClicked, ['gift_id' => $gift->id]);
        $this->event(AnalyticsEventName::LandingViewed, [
            'payload' => [
                'safe_count' => 3,
                'storage_path' => 'private/gifts/secret.webp',
                'text' => 'mensagem pessoal sensivel',
                'public_code' => 'ABC123',
            ],
        ]);

        $this
            ->actingAs($admin)
            ->get(AnalyticsOverview::getUrl())
            ->assertOk()
            ->assertSee('R$ 12,99')
            ->assertSee('Lucro bruto')
            ->assertSee('Templates')
            ->assertSee('Planos');

        Livewire::actingAs($admin)
            ->test(AnalyticsOverview::class)
            ->call('setActiveTab', 'operational')
            ->assertSee('gift_completed')
            ->assertSee('envelope_opened')
            ->assertSee('polaroid_flipped')
            ->assertSee('create_my_own_clicked')
            ->assertSee('safe_count')
            ->assertDontSee('storage_path')
            ->assertDontSee('private/gifts/secret.webp')
            ->assertDontSee('mensagem pessoal sensivel')
            ->assertDontSee('ABC123');
    }

    public function test_dashboard_supports_custom_period_and_comparison(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');

        $admin = $this->userWithRole('admin');
        $user = User::factory()->create();
        $plan = Plan::factory()->create();
        $currentGift = Gift::factory()->published()->create(['user_id' => $user->id, 'plan_id' => $plan->id]);
        $comparisonGift = Gift::factory()->published()->create(['user_id' => $user->id, 'plan_id' => $plan->id]);

        Order::factory()
            ->paid()
            ->create([
                'user_id' => $user->id,
                'gift_id' => $currentGift->id,
                'plan_id' => $plan->id,
                'amount_cents' => 1299,
                'paid_at' => Carbon::parse('2026-05-19 10:00:00'),
            ]);

        Order::factory()
            ->paid()
            ->create([
                'user_id' => $user->id,
                'gift_id' => $comparisonGift->id,
                'plan_id' => $plan->id,
                'amount_cents' => 1000,
                'paid_at' => Carbon::parse('2026-05-18 10:00:00'),
            ]);

        Livewire::actingAs($admin)
            ->test(AnalyticsOverview::class)
            ->call('setPeriod', 'custom')
            ->set('from', '2026-05-19')
            ->set('to', '2026-05-19')
            ->call('toggleComparison')
            ->set('compareFrom', '2026-05-18')
            ->set('compareTo', '2026-05-18')
            ->assertSet('period', 'custom')
            ->assertSet('compareEnabled', true)
            ->assertSee('Personalizado')
            ->assertSee('Comparando 2026-05-18 até 2026-05-18')
            ->assertSee('+R$ 2,99');
    }

    public function test_operational_feed_includes_activity_log_and_filters(): void
    {
        Carbon::setTestNow('2026-05-19 12:00:00');

        $admin = $this->userWithRole('admin');

        $this->event(AnalyticsEventName::CheckoutOpened, [
            'payload' => ['safe_count' => 7],
        ]);

        activity('admin')
            ->causedBy($admin)
            ->event(AnalyticsEventName::AdminThemeUpdated->value)
            ->withProperties([
                'safe_count' => 9,
                'storage_path' => 'private/admin/secret.json',
            ])
            ->log(AnalyticsEventName::AdminThemeUpdated->value);

        Livewire::actingAs($admin)
            ->test(AnalyticsOverview::class)
            ->call('setActiveTab', 'operational')
            ->assertSee('checkout_opened')
            ->assertSee('admin_theme_updated')
            ->assertSee('safe_count')
            ->assertDontSee('private/admin/secret.json')
            ->set('operationalType', 'activity')
            ->assertSee('admin_theme_updated')
            ->assertDontSee('checkout_opened');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function event(AnalyticsEventName $eventName, array $attributes = []): AnalyticsEvent
    {
        return AnalyticsEvent::query()->create([
            'event_name' => $eventName->value,
            'event_group' => $eventName->group()->value,
            'occurred_at' => now(),
            'source' => 'server',
            ...$attributes,
        ]);
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::findOrCreate($roleName, 'web');

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
