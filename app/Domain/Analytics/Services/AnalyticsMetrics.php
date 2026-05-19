<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\AnalyticsEventGroup;
use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsDailyMetric;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

final class AnalyticsMetrics
{
    /**
     * @return array<string, mixed>
     */
    public function adminDashboard(string $period = '30d', ?string $from = null, ?string $to = null, ?array $comparison = null): array
    {
        $range = $this->periodRange($period, $from, $to);
        $comparisonRange = $this->comparisonRange($comparison);

        $dashboard = [
            'period' => [
                'key' => $range['key'],
                'label' => $range['label'],
                'from' => $range['from']->toDateString(),
                'to' => $range['to']->toDateString(),
            ],
            'overview' => $this->overview($range),
            'revenue' => $this->revenue($range),
            'funnel' => $this->funnel($range),
            'viewer' => $this->viewer($range),
            'daily' => $this->daily($range),
            'preferences' => $this->preferences($range),
            'health' => $this->health(),
            'recent_events' => $this->recentEvents($range),
            'error_events' => $this->errorEvents(),
            'comparison' => ['enabled' => false],
        ];

        if ($comparisonRange !== null) {
            $dashboard['comparison'] = [
                'enabled' => true,
                'period' => [
                    'key' => $comparisonRange['key'],
                    'label' => $comparisonRange['label'],
                    'from' => $comparisonRange['from']->toDateString(),
                    'to' => $comparisonRange['to']->toDateString(),
                ],
                'overview' => $this->overview($comparisonRange),
                'revenue' => $this->revenue($comparisonRange),
                'viewer' => $this->viewer($comparisonRange),
                'daily' => $this->daily($comparisonRange),
            ];
        }

        return $dashboard;
    }

    /**
     * @param  array{search?: string, type?: string, source?: string}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function operationalFeed(array $range, array $filters = [], int $page = 1, int $perPage = 25): LengthAwarePaginator
    {
        $page = max(1, $page);
        $perPage = max(1, min(100, $perPage));
        $take = $page * $perPage;

        $analyticsQuery = $this->filteredAnalyticsFeedQuery($range, $filters);
        $activityQuery = $this->filteredActivityFeedQuery($range, $filters);
        $analyticsTotal = (clone $analyticsQuery)->count();
        $activityTotal = (clone $activityQuery)->count();

        $items = collect()
            ->merge(
                (clone $analyticsQuery)
                    ->with(['gift:id,title'])
                    ->latest('occurred_at')
                    ->limit($take)
                    ->get()
                    ->map(fn (AnalyticsEvent $event): array => $this->analyticsFeedRow($event))
            )
            ->merge(
                (clone $activityQuery)
                    ->orderByDesc('created_at')
                    ->limit($take)
                    ->get()
                    ->map(fn (object $activity): array => $this->activityFeedRow($activity))
            )
            ->sortByDesc('sort_time')
            ->values();

        return new LengthAwarePaginator(
            $items->slice(($page - 1) * $perPage, $perPage)->values(),
            $analyticsTotal + $activityTotal,
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'pageName' => 'page',
            ],
        );
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
    private function overview(array $range): array
    {
        $paidOrders = $this
            ->forRange(Order::query()->where('status', OrderStatus::Paid->value)->whereNotNull('paid_at'), 'paid_at', $range);
        $lastSevenDaysPaidOrders = Order::query()
            ->where('status', OrderStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', CarbonImmutable::now()->subDays(6)->startOfDay());
        $checkoutOpened = $this->eventCount(AnalyticsEventName::CheckoutOpened, $range);
        $orderPaid = $this->eventCount(AnalyticsEventName::OrderPaid, $range);

        return [
            'revenue_total_cents' => (int) (clone $paidOrders)->sum('amount_cents'),
            'revenue_7d_cents' => (int) $lastSevenDaysPaidOrders->sum('amount_cents'),
            'paid_orders' => (clone $paidOrders)->count(),
            'gifts_created' => $this->forRange(Gift::query(), 'created_at', $range)->count(),
            'gifts_published' => $this
                ->forRange(Gift::query()->where('status', GiftStatus::Published->value)->whereNotNull('published_at'), 'published_at', $range)
                ->count(),
            'public_visits' => $this->forRange(GiftVisit::query(), 'opened_at', $range)->count(),
            'unique_visitors' => $this->forRange(AnalyticsSession::query(), 'first_seen_at', $range)->count(),
            'checkout_to_paid_rate' => $checkoutOpened > 0 ? round(($orderPaid / $checkoutOpened) * 100, 1) : 0.0,
            'top_templates' => $this->topTemplates($range),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function revenue(array $range): array
    {
        $paidOrders = $this
            ->forRange(Order::query()->where('status', OrderStatus::Paid->value)->whereNotNull('paid_at'), 'paid_at', $range);
        $totalPaid = (clone $paidOrders)->count();
        $totalOrders = $this->forRange(Order::query(), 'created_at', $range)->count();
        $revenueCents = (int) (clone $paidOrders)->sum('amount_cents');

        return [
            'total_cents' => $revenueCents,
            'last_7_days_cents' => (int) Order::query()
                ->where('status', OrderStatus::Paid->value)
                ->whereNotNull('paid_at')
                ->where('paid_at', '>=', CarbonImmutable::now()->subDays(6)->startOfDay())
                ->sum('amount_cents'),
            'average_ticket_cents' => $totalPaid > 0 ? (int) round($revenueCents / $totalPaid) : 0,
            'approval_rate' => $totalOrders > 0 ? round(($totalPaid / $totalOrders) * 100, 1) : 0.0,
            'orders_by_status' => $this->countByStatus($this->forRange(Order::query(), 'created_at', $range), 'status'),
            'payments_by_status' => $this->countByStatus($this->forRange(Payment::query(), 'created_at', $range), 'status'),
            'revenue_by_plan' => $this->moneyByRelation($range, 'plans.name', 'plans', 'orders.plan_id', 'plans.id'),
            'revenue_by_template' => $this->revenueByGiftRelation($range, 'template_versions.name', 'template_versions', 'gifts.template_version_id', 'template_versions.id'),
            'revenue_by_occasion' => $this->revenueByGiftRelation($range, 'occasions.name', 'occasions', 'gifts.occasion_id', 'occasions.id'),
            'revenue_by_theme' => $this->revenueByGiftRelation($range, 'theme_versions.name', 'theme_versions', 'gifts.theme_version_id', 'theme_versions.id'),
            'revenue_by_day' => $this->revenueByDay($range),
        ];
    }

    /**
     * @return array<int, array{event: string, count: int, conversion_from_previous: float|null, dropoff_from_previous: float|null}>
     */
    private function funnel(array $range): array
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
            $count = $this->eventCount($step, $range);
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
    private function viewer(array $range): array
    {
        $visits = $this->forRange(GiftVisit::query(), 'opened_at', $range);
        $totalVisits = (clone $visits)->count();
        $completed = (clone $visits)->whereNotNull('completed_at')->count();
        $trafficSources = (clone $visits)
            ->selectRaw("COALESCE(public_source, 'unknown') as source, COUNT(*) as total")
            ->groupByRaw("COALESCE(public_source, 'unknown')")
            ->pluck('total', 'source')
            ->map(fn (mixed $value): int => (int) $value)
            ->all();

        return [
            'top_gifts' => $this->forRange(
                GiftVisit::query()
                    ->select('gift_id', DB::raw('COUNT(*) as visits'), DB::raw('SUM(page_views_count) as page_views'), DB::raw('SUM(interactions_count) as interactions')),
                'opened_at',
                $range,
            )
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
            'traffic_sources' => $this->normalizeTrafficSources($trafficSources),
            'gift_completed' => $this->eventCount(AnalyticsEventName::GiftCompleted, $range),
            'envelope_interactions' => $this->eventCount(AnalyticsEventName::EnvelopeOpened, $range) + $this->eventCount(AnalyticsEventName::EnvelopeClosed, $range),
            'polaroid_interactions' => $this->eventCount(AnalyticsEventName::PolaroidFlipped, $range),
            'create_my_own_clicked' => $this->eventCount(AnalyticsEventName::CreateMyOwnClicked, $range),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function daily(array $range): array
    {
        return [
            'revenue_by_day' => $this->revenueByDay($range),
            'paid_orders_by_day' => $this->rawCountByDay(
                Order::query()->where('status', OrderStatus::Paid->value)->whereNotNull('paid_at'),
                'paid_at',
                'orders',
                $range,
            ),
            'sessions_by_day' => $this->metricSeries(
                'sessions_total',
                'sessions',
                fn (): array => $this->rawCountByDay(AnalyticsSession::query(), 'first_seen_at', 'sessions', $range),
                $range,
            ),
            'public_gift_opened_by_day' => $this->metricSeries(
                'public_gift_opened',
                'opens',
                fn (): array => $this->rawCountByDay(GiftVisit::query(), 'opened_at', 'opens', $range),
                $range,
            ),
            'gifts_published_by_day' => $this->metricSeries(
                'gifts_published',
                'gifts',
                fn (): array => $this->rawCountByDay(Gift::query()->whereNotNull('published_at'), 'published_at', 'gifts', $range),
                $range,
            ),
            'funnel_by_day' => $this->funnelByDay($range),
        ];
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function preferences(array $range): array
    {
        return [
            'plans' => $this->preferenceRows(
                $this->giftUsageByRelation($range, 'plans.name', 'plans', 'gifts.plan_id', 'plans.id'),
                $this->moneyByRelation($range, 'plans.name', 'plans', 'orders.plan_id', 'plans.id', 20),
            ),
            'templates' => $this->preferenceRows(
                $this->giftUsageByRelation($range, 'template_versions.name', 'template_versions', 'gifts.template_version_id', 'template_versions.id'),
                $this->revenueByGiftRelation($range, 'template_versions.name', 'template_versions', 'gifts.template_version_id', 'template_versions.id', 20),
            ),
            'occasions' => $this->preferenceRows(
                $this->giftUsageByRelation($range, 'occasions.name', 'occasions', 'gifts.occasion_id', 'occasions.id'),
                $this->revenueByGiftRelation($range, 'occasions.name', 'occasions', 'gifts.occasion_id', 'occasions.id', 20),
            ),
            'themes' => $this->preferenceRows(
                $this->giftUsageByRelation($range, 'theme_versions.name', 'theme_versions', 'gifts.theme_version_id', 'theme_versions.id'),
                $this->revenueByGiftRelation($range, 'theme_versions.name', 'theme_versions', 'gifts.theme_version_id', 'theme_versions.id', 20),
            ),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function health(): array
    {
        $pruneEstimate = app(AnalyticsPruner::class)->estimate();
        $sessionsCount = AnalyticsSession::query()->count();
        $eventsCount = AnalyticsEvent::query()->count();
        $giftVisitsCount = GiftVisit::query()->count();
        $giftEventsCount = GiftEvent::query()->count();
        $dailyMetricsCount = AnalyticsDailyMetric::query()->count();
        $lastAggregatedDate = AnalyticsDailyMetric::query()->max('date');
        $rawDataCount = $sessionsCount + $eventsCount + $giftVisitsCount + $giftEventsCount;
        $needsAggregation = $rawDataCount > 0 && (
            blank($lastAggregatedDate)
            || CarbonImmutable::parse((string) $lastAggregatedDate)->lt(CarbonImmutable::yesterday()->startOfDay())
        );
        $status = match (true) {
            $rawDataCount === 0 && $dailyMetricsCount === 0 => 'no_data',
            $needsAggregation => 'needs_aggregation',
            default => 'ok',
        };

        return [
            'status' => $status,
            'status_label' => match ($status) {
                'ok' => 'OK',
                'needs_aggregation' => 'Precisa agregação',
                default => 'Sem dados',
            },
            'sessions_count' => $sessionsCount,
            'events_count' => $eventsCount,
            'gift_visits_count' => $giftVisitsCount,
            'gift_events_count' => $giftEventsCount,
            'last_aggregated_date' => $lastAggregatedDate,
            'daily_metrics_count' => $dailyMetricsCount,
            'oldest_event_at' => AnalyticsEvent::query()->min('occurred_at'),
            'newest_event_at' => AnalyticsEvent::query()->max('occurred_at'),
            'last_event_at' => AnalyticsEvent::query()->max('occurred_at'),
            'prune_estimate_total' => $pruneEstimate['total'],
            'prune_estimate_tables' => $pruneEstimate['tables'],
            'commands' => [
                [
                    'title' => 'Agregar ontem',
                    'command' => 'php artisan scrapbook:analytics-aggregate',
                    'description' => 'Calcula a métrica diária padrão do dia anterior.',
                ],
                [
                    'title' => 'Agregar uma data',
                    'command' => 'php artisan scrapbook:analytics-aggregate --date=YYYY-MM-DD',
                    'description' => 'Reprocessa um dia específico sem mexer em tracking.',
                ],
                [
                    'title' => 'Simular prune',
                    'command' => 'php artisan scrapbook:analytics-prune --dry-run',
                    'description' => 'Mostra registros elegíveis antes de remover qualquer dado.',
                ],
                [
                    'title' => 'Executar prune',
                    'command' => 'php artisan scrapbook:analytics-prune --force',
                    'description' => 'Aplica retenção configurada preservando pedidos, pagamentos, gifts e usuários.',
                ],
            ],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function recentEvents(array $range): array
    {
        return $this->forRange(
            AnalyticsEvent::query()->with(['gift:id,title', 'order:id']),
            'occurred_at',
            $range,
        )
            ->latest('occurred_at')
            ->limit(15)
            ->get()
            ->map(fn (AnalyticsEvent $event): array => [
                'time' => $event->occurred_at?->toDateTimeString(),
                'event_name' => $event->event_name,
                'event_group' => $event->event_group,
                'user' => $event->user_id ? 'linked' : null,
                'gift' => $event->gift?->title,
                'order' => $event->order_id,
                'source' => $event->source,
                'payload_items' => $this->payloadItems($event->payload),
                'payload_summary' => $this->payloadSummary($event->payload),
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
                'message' => $this->payloadMessage($event->payload),
                'context_items' => $this->payloadItems($event->payload),
                'context' => $this->payloadSummary($event->payload),
                'severity' => $this->payloadSeverity($event->payload),
            ])
            ->all();
    }

    /**
     * @param  array{search?: string, type?: string, source?: string}  $filters
     */
    private function filteredAnalyticsFeedQuery(array $range, array $filters): mixed
    {
        $query = $this->forRange(AnalyticsEvent::query(), 'occurred_at', $range);
        $search = trim((string) ($filters['search'] ?? ''));
        $type = trim((string) ($filters['type'] ?? ''));
        $source = trim((string) ($filters['source'] ?? ''));

        if ($search !== '') {
            $query->where(function ($query) use ($search): void {
                $query
                    ->where('event_name', 'like', "%{$search}%")
                    ->orWhere('event_group', 'like', "%{$search}%")
                    ->orWhere('source', 'like', "%{$search}%");
            });
        }

        if ($type === 'activity') {
            $query->whereRaw('1 = 0');
        } elseif ($type !== '') {
            $query->where(function ($query) use ($type): void {
                $query
                    ->where('event_group', $type)
                    ->orWhere('event_name', $type);
            });
        }

        if ($source !== '') {
            $query->where('source', $source);
        }

        return $query;
    }

    /**
     * @param  array{search?: string, type?: string, source?: string}  $filters
     */
    private function filteredActivityFeedQuery(array $range, array $filters): mixed
    {
        $query = DB::table('activity_log')->whereBetween('created_at', [$range['from'], $range['to']]);
        $search = trim((string) ($filters['search'] ?? ''));
        $type = trim((string) ($filters['type'] ?? ''));
        $source = trim((string) ($filters['source'] ?? ''));

        if ($search !== '') {
            $query->where(function ($query) use ($search): void {
                $query
                    ->where('description', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%");
            });
        }

        if ($type !== '' && $type !== 'activity') {
            $query->where(function ($query) use ($type): void {
                $query
                    ->where('event', $type)
                    ->orWhere('log_name', $type);
            });
        }

        if ($source !== '') {
            $query->where('log_name', $source);
        }

        return $query;
    }

    /**
     * @return array<string, mixed>
     */
    private function analyticsFeedRow(AnalyticsEvent $event): array
    {
        return [
            'id' => 'analytics-'.$event->id,
            'kind' => 'analytics',
            'time' => $event->occurred_at?->toDateTimeString() ?? 'N/D',
            'sort_time' => $event->occurred_at?->getTimestamp() ?? 0,
            'title' => $event->event_name,
            'code' => $event->event_name,
            'type' => $event->event_group,
            'origin' => $event->source,
            'context' => array_values(array_filter([
                $event->gift?->title ? 'Gift: '.Str::limit($event->gift->title, 48, '') : null,
                $event->order_id ? 'Pedido vinculado' : null,
                $event->user_id ? 'Usuário vinculado' : null,
            ])),
            'items' => $this->payloadItems($event->payload),
            'summary' => $this->payloadSummary($event->payload),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function activityFeedRow(object $activity): array
    {
        $details = $this->decodePayload($activity->properties ?? null);

        if ($details === []) {
            $details = $this->decodePayload($activity->attribute_changes ?? null);
        }

        $title = filled($activity->event ?? null)
            ? (string) $activity->event
            : (string) $activity->description;

        return [
            'id' => 'activity-'.$activity->id,
            'kind' => 'activity',
            'time' => CarbonImmutable::parse((string) $activity->created_at)->toDateTimeString(),
            'sort_time' => CarbonImmutable::parse((string) $activity->created_at)->getTimestamp(),
            'title' => Str::limit($title, 72, ''),
            'code' => $activity->event ?: $activity->log_name ?: 'activity',
            'type' => 'activity',
            'origin' => $activity->log_name ?: 'activity',
            'context' => array_values(array_filter([
                $activity->subject_type ? class_basename((string) $activity->subject_type) : null,
                $activity->causer_type ? 'Causer: '.class_basename((string) $activity->causer_type) : null,
            ])),
            'items' => $this->payloadItems($details),
            'summary' => $details === [] ? Str::limit((string) $activity->description, 120, '') : $this->payloadSummary($details),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function decodePayload(mixed $payload): array
    {
        if (is_array($payload)) {
            return $payload;
        }

        if (! is_string($payload) || trim($payload) === '') {
            return [];
        }

        $decoded = json_decode($payload, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function eventCount(AnalyticsEventName $event, ?array $range = null): int
    {
        $query = AnalyticsEvent::query()->where('event_name', $event->value);

        if ($range !== null) {
            $this->forRange($query, 'occurred_at', $range);
        }

        return $query->count();
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
    private function moneyByRelation(array $range, string $labelColumn, string $joinTable, string $leftColumn, string $rightColumn, int $limit = 8): array
    {
        return $this
            ->forRange(
                Order::query()
                    ->where('orders.status', OrderStatus::Paid->value)
                    ->whereNotNull('orders.paid_at')
                    ->leftJoin($joinTable, $leftColumn, '=', $rightColumn),
                'orders.paid_at',
                $range,
            )
            ->selectRaw("COALESCE({$labelColumn}, 'Sem dimensão') as name, SUM(orders.amount_cents) as revenue_cents, COUNT(*) as orders_count")
            ->groupByRaw("COALESCE({$labelColumn}, 'Sem dimensão')")
            ->orderByDesc('revenue_cents')
            ->limit($limit)
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
    private function revenueByGiftRelation(array $range, string $labelColumn, string $joinTable, string $leftColumn, string $rightColumn, int $limit = 8): array
    {
        return $this
            ->forRange(
                Order::query()
                    ->where('orders.status', OrderStatus::Paid->value)
                    ->whereNotNull('orders.paid_at')
                    ->join('gifts', 'orders.gift_id', '=', 'gifts.id')
                    ->leftJoin($joinTable, $leftColumn, '=', $rightColumn),
                'orders.paid_at',
                $range,
            )
            ->selectRaw("COALESCE({$labelColumn}, 'Sem dimensão') as name, SUM(orders.amount_cents) as revenue_cents, COUNT(*) as orders_count")
            ->groupByRaw("COALESCE({$labelColumn}, 'Sem dimensão')")
            ->orderByDesc('revenue_cents')
            ->limit($limit)
            ->get()
            ->map(fn (object $row): array => [
                'name' => (string) $row->name,
                'revenue_cents' => (int) $row->revenue_cents,
                'orders_count' => (int) $row->orders_count,
            ])
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function giftUsageByRelation(array $range, string $labelColumn, string $joinTable, string $leftColumn, string $rightColumn): array
    {
        return $this
            ->forRange(
                Gift::query()->leftJoin($joinTable, $leftColumn, '=', $rightColumn),
                'gifts.created_at',
                $range,
            )
            ->selectRaw("COALESCE({$labelColumn}, 'Sem dimensão') as name, COUNT(*) as usage_count")
            ->groupByRaw("COALESCE({$labelColumn}, 'Sem dimensão')")
            ->pluck('usage_count', 'name')
            ->map(fn (mixed $value): int => (int) $value)
            ->all();
    }

    /**
     * @param  array<string, int>  $usage
     * @param  array<int, array{name: string, revenue_cents: int, orders_count: int}>  $revenue
     * @return array<int, array{name: string, usage_count: int, revenue_cents: int, orders_count: int, usage_share: float}>
     */
    private function preferenceRows(array $usage, array $revenue): array
    {
        $revenueByName = collect($revenue)->keyBy('name');
        $names = collect(array_keys($usage))
            ->merge($revenueByName->keys())
            ->unique()
            ->values();
        $totalUsage = max(1, array_sum($usage));

        return $names
            ->map(fn (string $name): array => [
                'name' => $name,
                'usage_count' => $usage[$name] ?? 0,
                'revenue_cents' => (int) ($revenueByName[$name]['revenue_cents'] ?? 0),
                'orders_count' => (int) ($revenueByName[$name]['orders_count'] ?? 0),
                'usage_share' => round((($usage[$name] ?? 0) / $totalUsage) * 100, 1),
            ])
            ->sortByDesc(fn (array $row): int => ($row['usage_count'] * 1_000_000) + ($row['orders_count'] * 10_000) + min($row['revenue_cents'], 9_999))
            ->take(6)
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{date: string, revenue_cents: int}>
     */
    private function revenueByDay(array $range): array
    {
        $aggregated = $this->metricSeries(
            'revenue_approved_cents',
            'revenue_cents',
            fn (): array => [],
            $range,
        );

        if ($aggregated !== []) {
            return $aggregated;
        }

        return Order::query()
            ->where('status', OrderStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$range['from'], $range['to']])
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
     * @param  callable(): array<int, array<string, mixed>>  $fallback
     * @return array<int, array<string, mixed>>
     */
    private function metricSeries(string $metricKey, string $valueKey, callable $fallback, array $range): array
    {
        $metrics = AnalyticsDailyMetric::query()
            ->whereBetween('date', [$range['from']->toDateString(), $range['to']->toDateString()])
            ->where('metric_key', $metricKey)
            ->whereNull('dimensions')
            ->orderBy('date')
            ->get(['date', 'value_numeric']);

        if ($metrics->isEmpty()) {
            return $fallback();
        }

        return $metrics
            ->map(fn (AnalyticsDailyMetric $metric): array => [
                'date' => $metric->date?->toDateString(),
                $valueKey => (int) $metric->value_numeric,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function rawCountByDay(mixed $query, string $dateColumn, string $valueKey, array $range): array
    {
        return $query
            ->whereNotNull($dateColumn)
            ->whereBetween($dateColumn, [$range['from'], $range['to']])
            ->selectRaw("DATE({$dateColumn}) as metric_date, COUNT(*) as aggregate_value")
            ->groupByRaw("DATE({$dateColumn})")
            ->orderBy('metric_date')
            ->get()
            ->map(fn (object $row): array => [
                'date' => (string) $row->metric_date,
                $valueKey => (int) $row->aggregate_value,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function funnelByDay(array $range): array
    {
        $metricKeys = [
            'funnel_landing_viewed',
            'funnel_create_started',
            'funnel_occasion_selected',
            'funnel_template_selected',
            'funnel_gift_created',
            'funnel_editor_opened',
            'funnel_review_opened',
            'funnel_checkout_opened',
            'funnel_order_created',
            'funnel_payment_approved',
            'funnel_gift_published',
            'funnel_public_gift_opened',
        ];
        $metrics = AnalyticsDailyMetric::query()
            ->whereBetween('date', [$range['from']->toDateString(), $range['to']->toDateString()])
            ->whereIn('metric_key', $metricKeys)
            ->whereNull('dimensions')
            ->orderBy('date')
            ->get(['date', 'metric_key', 'value_numeric']);

        if ($metrics->isEmpty()) {
            return $this->rawFunnelByDay($range);
        }

        return $metrics
            ->groupBy(fn (AnalyticsDailyMetric $metric): string => $metric->date?->toDateString() ?? '')
            ->map(fn ($rows, string $date): array => [
                'date' => $date,
                'steps' => $rows
                    ->mapWithKeys(fn (AnalyticsDailyMetric $metric): array => [$metric->metric_key => (int) $metric->value_numeric])
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function rawFunnelByDay(array $range): array
    {
        $events = [
            AnalyticsEventName::LandingViewed->value => 'funnel_landing_viewed',
            AnalyticsEventName::CreateFlowStarted->value => 'funnel_create_started',
            AnalyticsEventName::OccasionSelected->value => 'funnel_occasion_selected',
            AnalyticsEventName::TemplateSelected->value => 'funnel_template_selected',
            AnalyticsEventName::GiftDraftCreated->value => 'funnel_gift_created',
            AnalyticsEventName::EditorOpened->value => 'funnel_editor_opened',
            AnalyticsEventName::ReviewOpened->value => 'funnel_review_opened',
            AnalyticsEventName::CheckoutOpened->value => 'funnel_checkout_opened',
            AnalyticsEventName::OrderCreated->value => 'funnel_order_created',
            AnalyticsEventName::PaymentApproved->value => 'funnel_payment_approved',
            AnalyticsEventName::GiftPublished->value => 'funnel_gift_published',
            AnalyticsEventName::PublicGiftOpened->value => 'funnel_public_gift_opened',
        ];

        return AnalyticsEvent::query()
            ->whereIn('event_name', array_keys($events))
            ->whereBetween('occurred_at', [$range['from'], $range['to']])
            ->selectRaw('DATE(occurred_at) as metric_date, event_name, COUNT(*) as aggregate_value')
            ->groupByRaw('DATE(occurred_at), event_name')
            ->orderBy('metric_date')
            ->get()
            ->groupBy('metric_date')
            ->map(fn ($rows, string $date): array => [
                'date' => $date,
                'steps' => $rows
                    ->mapWithKeys(fn (object $row): array => [$events[(string) $row->event_name] => (int) $row->aggregate_value])
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{name: string, gifts_count: int}>
     */
    private function topTemplates(array $range): array
    {
        return $this
            ->forRange(
                Gift::query()->leftJoin('template_versions', 'gifts.template_version_id', '=', 'template_versions.id'),
                'gifts.created_at',
                $range,
            )
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

    /**
     * @return array{key: string, label: string, from: CarbonImmutable, to: CarbonImmutable}
     */
    private function periodRange(string $period, ?string $from = null, ?string $to = null): array
    {
        $now = CarbonImmutable::now();

        if ($period === 'custom') {
            $custom = $this->customRange('custom', 'Personalizado', $from, $to);

            if ($custom !== null) {
                return $custom;
            }
        }

        return match ($period) {
            'today' => [
                'key' => 'today',
                'label' => 'Hoje',
                'from' => $now->startOfDay(),
                'to' => $now->endOfDay(),
            ],
            '7d' => [
                'key' => '7d',
                'label' => 'Últimos 7 dias',
                'from' => $now->subDays(6)->startOfDay(),
                'to' => $now->endOfDay(),
            ],
            'this_month' => [
                'key' => 'this_month',
                'label' => 'Este mês',
                'from' => $now->startOfMonth(),
                'to' => $now->endOfDay(),
            ],
            default => [
                'key' => '30d',
                'label' => 'Últimos 30 dias',
                'from' => $now->subDays(29)->startOfDay(),
                'to' => $now->endOfDay(),
            ],
        };
    }

    /**
     * @param  array<string, mixed>|null  $comparison
     * @return array{key: string, label: string, from: CarbonImmutable, to: CarbonImmutable}|null
     */
    private function comparisonRange(?array $comparison): ?array
    {
        if (! ($comparison['enabled'] ?? false)) {
            return null;
        }

        return $this->customRange(
            'comparison',
            'Comparação',
            is_string($comparison['from'] ?? null) ? $comparison['from'] : null,
            is_string($comparison['to'] ?? null) ? $comparison['to'] : null,
        );
    }

    /**
     * @return array{key: string, label: string, from: CarbonImmutable, to: CarbonImmutable}|null
     */
    private function customRange(string $key, string $label, ?string $from, ?string $to): ?array
    {
        $fromDate = $this->parseDate($from);
        $toDate = $this->parseDate($to);

        if ($fromDate === null || $toDate === null) {
            return null;
        }

        if ($fromDate->gt($toDate)) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        return [
            'key' => $key,
            'label' => $label,
            'from' => $fromDate->startOfDay(),
            'to' => $toDate->endOfDay(),
        ];
    }

    private function parseDate(?string $value): ?CarbonImmutable
    {
        if (blank($value)) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    private function forRange(mixed $query, string $column, array $range): mixed
    {
        return $query->whereBetween($column, [$range['from'], $range['to']]);
    }

    /**
     * @param  array<string, int>  $sources
     * @return array<string, int>
     */
    private function normalizeTrafficSources(array $sources): array
    {
        $normalized = [
            'direct' => 0,
            'qr' => 0,
            'share_card' => 0,
            'copy_link' => 0,
            'link' => 0,
            'unknown' => 0,
        ];

        foreach ($sources as $source => $total) {
            $normalized[(string) $source] = (int) $total;
        }

        return $normalized;
    }

    private function payloadSummary(mixed $payload): string
    {
        $items = $this->payloadItems($payload);

        if ($items === []) {
            return 'Sem payload exibível';
        }

        $summary = collect($items)
            ->map(fn (array $item): string => "{$item['label']}: {$item['value']}")
            ->implode(' · ');

        return Str::limit($summary, 180);
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    private function payloadItems(mixed $payload): array
    {
        $displayable = $this->displayablePayload($payload);

        if ($displayable === []) {
            return [];
        }

        return $this->flattenPayloadItems($displayable);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<int, array{label: string, value: string}>
     */
    private function flattenPayloadItems(array $payload, string $prefix = '', int $limit = 4): array
    {
        $items = [];

        foreach ($payload as $key => $value) {
            $label = $prefix === '' ? (string) $key : "{$prefix}.{$key}";

            if (is_array($value)) {
                $items = [
                    ...$items,
                    ...$this->flattenPayloadItems($value, $label, $limit - count($items)),
                ];
            } elseif (is_scalar($value) || $value === null) {
                $items[] = [
                    'label' => Str::limit($label, 36, ''),
                    'value' => $this->payloadItemValue($value),
                ];
            }

            if (count($items) >= $limit) {
                break;
            }
        }

        return array_slice($items, 0, $limit);
    }

    private function payloadItemValue(mixed $value): string
    {
        if ($value === null) {
            return 'null';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        return Str::limit((string) $value, 64, '');
    }

    private function payloadMessage(mixed $payload): string
    {
        if (! is_array($payload)) {
            return 'Sem mensagem';
        }

        foreach (['message', 'error', 'reason', 'exception'] as $key) {
            if (array_key_exists($key, $payload) && is_scalar($payload[$key])) {
                return $this->safeScalar($payload[$key], 120);
            }
        }

        return 'Sem mensagem';
    }

    private function payloadSeverity(mixed $payload): string
    {
        if (! is_array($payload)) {
            return 'error';
        }

        foreach (['severity', 'level', 'status'] as $key) {
            if (array_key_exists($key, $payload) && is_scalar($payload[$key])) {
                $severity = Str::lower((string) $payload[$key]);

                return match ($severity) {
                    'debug', 'info', 'notice', 'warning', 'error', 'critical' => $severity,
                    default => 'error',
                };
            }
        }

        return 'error';
    }

    /**
     * @return array<string, mixed>
     */
    private function displayablePayload(mixed $payload, int $depth = 0): array
    {
        if (! is_array($payload) || $depth > 1) {
            return [];
        }

        $displayable = [];

        foreach ($payload as $key => $value) {
            $key = is_string($key) ? $key : (string) $key;

            if ($this->isSensitivePayloadKey($key)) {
                continue;
            }

            if (is_scalar($value) || $value === null) {
                $displayable[$key] = $this->safeScalar($value);
                continue;
            }

            if (is_array($value)) {
                $nested = $this->displayablePayload($value, $depth + 1);

                if ($nested !== []) {
                    $displayable[$key] = $nested;
                }
            }

            if (count($displayable) >= 6) {
                break;
            }
        }

        return $displayable;
    }

    private function isSensitivePayloadKey(string $key): bool
    {
        return Str::contains(Str::lower($key), [
            'authorization',
            'cookie',
            'filename',
            'file_name',
            'html',
            'ip',
            'password',
            'path',
            'public_code',
            'secret',
            'src',
            'storage',
            'text',
            'token',
            'url',
            'user_agent',
        ]);
    }

    private function safeScalar(mixed $value, int $limit = 80): string|int|float|bool|null
    {
        if (! is_string($value)) {
            return is_scalar($value) || $value === null ? $value : null;
        }

        $lowerValue = Str::lower($value);

        if (Str::contains($lowerValue, ['storage_path', '/storage/', 'private/', 'public_code', 'bearer ', 'token='])) {
            return '[mascarado]';
        }

        return Str::limit($value, $limit);
    }
}
