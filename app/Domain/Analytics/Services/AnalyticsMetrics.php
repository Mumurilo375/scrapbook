<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\AnalyticsEventGroup;
use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use Illuminate\Support\Facades\DB;

final class AnalyticsMetrics
{
    /**
     * @return array<string, mixed>
     */
    public function adminDashboard(): array
    {
        return [
            'overview' => $this->overview(),
            'revenue' => $this->revenue(),
            'funnel' => $this->funnel(),
            'viewer' => $this->viewer(),
            'recent_events' => $this->recentEvents(),
            'error_events' => $this->errorEvents(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function giftOwnerSummary(Gift $gift): array
    {
        $visits = GiftVisit::query()->where('gift_id', $gift->id);
        $totalVisits = (clone $visits)->count();
        $uniqueVisitors = (clone $visits)->whereNotNull('analytics_session_id')->distinct('analytics_session_id')->count('analytics_session_id');

        if ($uniqueVisitors === 0) {
            $uniqueVisitors = (clone $visits)->whereNotNull('session_hash')->distinct('session_hash')->count('session_hash');
        }

        $sources = (clone $visits)
            ->selectRaw("COALESCE(public_source, 'unknown') as public_source, COUNT(*) as total")
            ->groupByRaw("COALESCE(public_source, 'unknown')")
            ->pluck('total', 'public_source')
            ->map(fn (mixed $value): int => (int) $value)
            ->all();

        $pageViews = (clone $visits)->sum('page_views_count');
        $interactions = (clone $visits)->sum('interactions_count');
        $completed = (clone $visits)->whereNotNull('completed_at')->count();

        return [
            'total_views' => $totalVisits,
            'unique_visitors' => $uniqueVisitors,
            'sources' => $sources,
            'page_views' => (int) $pageViews,
            'completion_count' => $completed,
            'completion_rate' => $totalVisits > 0 ? round(($completed / $totalVisits) * 100, 1) : 0.0,
            'interactions_count' => (int) $interactions,
            'envelope_interactions' => $this->giftEventCount($gift, [AnalyticsEventName::EnvelopeOpened, AnalyticsEventName::EnvelopeClosed]),
            'polaroid_interactions' => $this->giftEventCount($gift, [AnalyticsEventName::PolaroidFlipped]),
            'last_access_at' => (clone $visits)->max('opened_at'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function overview(): array
    {
        $paidOrders = Order::query()->where('status', OrderStatus::Paid->value);
        $checkoutOpened = $this->eventCount(AnalyticsEventName::CheckoutOpened);
        $orderPaid = $this->eventCount(AnalyticsEventName::OrderPaid);

        return [
            'revenue_total_cents' => (int) (clone $paidOrders)->sum('amount_cents'),
            'revenue_7d_cents' => (int) (clone $paidOrders)->where('paid_at', '>=', now()->subDays(7))->sum('amount_cents'),
            'gifts_created' => Gift::query()->count(),
            'gifts_published' => Gift::query()->where('status', GiftStatus::Published->value)->count(),
            'public_visits' => GiftVisit::query()->count(),
            'unique_visitors' => AnalyticsSession::query()->count(),
            'checkout_to_paid_rate' => $checkoutOpened > 0 ? round(($orderPaid / $checkoutOpened) * 100, 1) : 0.0,
            'top_templates' => $this->topTemplates(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function revenue(): array
    {
        $paidOrders = Order::query()->where('status', OrderStatus::Paid->value);
        $totalPaid = (clone $paidOrders)->count();
        $totalOrders = Order::query()->count();
        $revenueCents = (int) (clone $paidOrders)->sum('amount_cents');

        return [
            'total_cents' => $revenueCents,
            'average_ticket_cents' => $totalPaid > 0 ? (int) round($revenueCents / $totalPaid) : 0,
            'approval_rate' => $totalOrders > 0 ? round(($totalPaid / $totalOrders) * 100, 1) : 0.0,
            'orders_by_status' => $this->countByStatus(Order::query(), 'status'),
            'payments_by_status' => $this->countByStatus(Payment::query(), 'status'),
            'revenue_by_plan' => $this->moneyByRelation('plans.name', 'plans', 'orders.plan_id', 'plans.id'),
            'revenue_by_template' => $this->revenueByGiftRelation('template_versions.name', 'template_versions', 'gifts.template_version_id', 'template_versions.id'),
            'revenue_by_occasion' => $this->revenueByGiftRelation('occasions.name', 'occasions', 'gifts.occasion_id', 'occasions.id'),
            'revenue_by_theme' => $this->revenueByGiftRelation('theme_versions.name', 'theme_versions', 'gifts.theme_version_id', 'theme_versions.id'),
            'revenue_by_day' => $this->revenueByDay(),
        ];
    }

    /**
     * @return array<int, array{event: string, count: int, conversion_from_previous: float|null, dropoff_from_previous: float|null}>
     */
    private function funnel(): array
    {
        $steps = [
            AnalyticsEventName::LandingViewed,
            AnalyticsEventName::CreateFlowStarted,
            AnalyticsEventName::OccasionSelected,
            AnalyticsEventName::TemplateSelected,
            AnalyticsEventName::UserRegistered,
            AnalyticsEventName::GiftDraftCreated,
            AnalyticsEventName::EditorOpened,
            AnalyticsEventName::PreviewOpened,
            AnalyticsEventName::ReviewOpened,
            AnalyticsEventName::CheckoutOpened,
            AnalyticsEventName::OrderCreated,
            AnalyticsEventName::PaymentApproved,
            AnalyticsEventName::GiftPublished,
            AnalyticsEventName::PublicGiftOpened,
        ];

        $previous = null;
        $funnel = [];

        foreach ($steps as $step) {
            $count = $this->eventCount($step);
            $conversion = $previous !== null && $previous > 0 ? round(($count / $previous) * 100, 1) : null;

            $funnel[] = [
                'event' => $step->value,
                'count' => $count,
                'conversion_from_previous' => $conversion,
                'dropoff_from_previous' => $conversion !== null ? round(100 - $conversion, 1) : null,
            ];

            $previous = $count;
        }

        return $funnel;
    }

    /**
     * @return array<string, mixed>
     */
    private function viewer(): array
    {
        $visits = GiftVisit::query();
        $totalVisits = (clone $visits)->count();
        $completed = (clone $visits)->whereNotNull('completed_at')->count();

        return [
            'top_gifts' => GiftVisit::query()
                ->select('gift_id', DB::raw('COUNT(*) as visits'), DB::raw('SUM(page_views_count) as page_views'), DB::raw('SUM(interactions_count) as interactions'))
                ->with('gift:id,title')
                ->groupBy('gift_id')
                ->orderByDesc('visits')
                ->limit(8)
                ->get()
                ->map(fn (GiftVisit $visit): array => [
                    'gift' => $visit->gift?->title ?? 'Gift removido',
                    'visits' => (int) $visit->getAttribute('visits'),
                    'page_views' => (int) $visit->getAttribute('page_views'),
                    'interactions' => (int) $visit->getAttribute('interactions'),
                ])
                ->all(),
            'completion_rate' => $totalVisits > 0 ? round(($completed / $totalVisits) * 100, 1) : 0.0,
            'average_pages_viewed' => $totalVisits > 0 ? round(((int) (clone $visits)->sum('page_views_count')) / $totalVisits, 1) : 0.0,
            'traffic_sources' => (clone $visits)
                ->selectRaw("COALESCE(public_source, 'unknown') as source, COUNT(*) as total")
                ->groupByRaw("COALESCE(public_source, 'unknown')")
                ->pluck('total', 'source')
                ->map(fn (mixed $value): int => (int) $value)
                ->all(),
            'envelope_interactions' => $this->eventCount(AnalyticsEventName::EnvelopeOpened) + $this->eventCount(AnalyticsEventName::EnvelopeClosed),
            'polaroid_interactions' => $this->eventCount(AnalyticsEventName::PolaroidFlipped),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentEvents(): array
    {
        return AnalyticsEvent::query()
            ->with(['user:id,email', 'gift:id,title', 'order:id,provider_reference'])
            ->latest('occurred_at')
            ->limit(20)
            ->get()
            ->map(fn (AnalyticsEvent $event): array => [
                'time' => $event->occurred_at?->toDateTimeString(),
                'event_name' => $event->event_name,
                'event_group' => $event->event_group,
                'user' => $event->user?->email,
                'gift' => $event->gift?->title,
                'order' => $event->order?->provider_reference ?? $event->order_id,
                'source' => $event->source,
                'payload' => $event->payload,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function errorEvents(): array
    {
        return AnalyticsEvent::query()
            ->where(function ($query): void {
                $query
                    ->where('event_group', AnalyticsEventGroup::Error->value)
                    ->orWhereIn('event_name', [
                        AnalyticsEventName::AutosaveError->value,
                        AnalyticsEventName::UploadFailed->value,
                        AnalyticsEventName::MediaProcessingFailed->value,
                        AnalyticsEventName::AssetProcessingFailed->value,
                        AnalyticsEventName::PaymentWebhookFailed->value,
                        AnalyticsEventName::ViewerLoadFailed->value,
                    ]);
            })
            ->latest('occurred_at')
            ->limit(15)
            ->get(['event_name', 'source', 'occurred_at', 'payload'])
            ->map(fn (AnalyticsEvent $event): array => [
                'time' => $event->occurred_at?->toDateTimeString(),
                'event_name' => $event->event_name,
                'source' => $event->source,
                'payload' => $event->payload,
            ])
            ->all();
    }

    private function eventCount(AnalyticsEventName $event): int
    {
        return AnalyticsEvent::query()->where('event_name', $event->value)->count();
    }

    /**
     * @param  array<int, AnalyticsEventName>  $events
     */
    private function giftEventCount(Gift $gift, array $events): int
    {
        return GiftEvent::query()
            ->where('gift_id', $gift->id)
            ->whereIn('event_name', array_map(fn (AnalyticsEventName $event): string => $event->value, $events))
            ->count();
    }

    /**
     * @return array<string, int>
     */
    private function countByStatus(mixed $query, string $column): array
    {
        return $query
            ->select($column, DB::raw('COUNT(*) as total'))
            ->groupBy($column)
            ->pluck('total', $column)
            ->map(fn (mixed $value): int => (int) $value)
            ->all();
    }

    /**
     * @return array<int, array{name: string, revenue_cents: int, orders_count: int}>
     */
    private function moneyByRelation(string $labelColumn, string $joinTable, string $leftColumn, string $rightColumn): array
    {
        return Order::query()
            ->where('orders.status', OrderStatus::Paid->value)
            ->leftJoin($joinTable, $leftColumn, '=', $rightColumn)
            ->selectRaw("COALESCE({$labelColumn}, 'Sem dimensão') as name, SUM(orders.amount_cents) as revenue_cents, COUNT(*) as orders_count")
            ->groupByRaw("COALESCE({$labelColumn}, 'Sem dimensão')")
            ->orderByDesc('revenue_cents')
            ->limit(8)
            ->get()
            ->map(fn (object $row): array => [
                'name' => (string) $row->name,
                'revenue_cents' => (int) $row->revenue_cents,
                'orders_count' => (int) $row->orders_count,
            ])
            ->all();
    }

    /**
     * @return array<int, array{name: string, revenue_cents: int, orders_count: int}>
     */
    private function revenueByGiftRelation(string $labelColumn, string $joinTable, string $leftColumn, string $rightColumn): array
    {
        return Order::query()
            ->where('orders.status', OrderStatus::Paid->value)
            ->join('gifts', 'orders.gift_id', '=', 'gifts.id')
            ->leftJoin($joinTable, $leftColumn, '=', $rightColumn)
            ->selectRaw("COALESCE({$labelColumn}, 'Sem dimensão') as name, SUM(orders.amount_cents) as revenue_cents, COUNT(*) as orders_count")
            ->groupByRaw("COALESCE({$labelColumn}, 'Sem dimensão')")
            ->orderByDesc('revenue_cents')
            ->limit(8)
            ->get()
            ->map(fn (object $row): array => [
                'name' => (string) $row->name,
                'revenue_cents' => (int) $row->revenue_cents,
                'orders_count' => (int) $row->orders_count,
            ])
            ->all();
    }

    /**
     * @return array<int, array{date: string, revenue_cents: int}>
     */
    private function revenueByDay(): array
    {
        return Order::query()
            ->where('status', OrderStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(paid_at) as paid_date, SUM(amount_cents) as revenue_cents')
            ->groupByRaw('DATE(paid_at)')
            ->orderBy('paid_date')
            ->get()
            ->map(fn (object $row): array => [
                'date' => (string) $row->paid_date,
                'revenue_cents' => (int) $row->revenue_cents,
            ])
            ->all();
    }

    /**
     * @return array<int, array{name: string, gifts_count: int}>
     */
    private function topTemplates(): array
    {
        return Gift::query()
            ->leftJoin('template_versions', 'gifts.template_version_id', '=', 'template_versions.id')
            ->selectRaw("COALESCE(template_versions.name, 'Sem template') as name, COUNT(*) as gifts_count")
            ->groupByRaw("COALESCE(template_versions.name, 'Sem template')")
            ->orderByDesc('gifts_count')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'name' => (string) $row->name,
                'gifts_count' => (int) $row->gifts_count,
            ])
            ->all();
    }
}
