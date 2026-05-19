<?php

namespace App\Filament\Pages;

use App\Domain\Analytics\Services\AnalyticsMetrics;
use App\Filament\Support\AdminAccess;
use BackedEnum;
use Carbon\CarbonImmutable;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Livewire\Attributes\Url;
use Livewire\WithPagination;
use Throwable;
use UnitEnum;

class AnalyticsOverview extends Page
{
    use WithPagination;

    protected static ?string $slug = 'analytics';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static string|UnitEnum|null $navigationGroup = 'Analytics';

    protected static ?string $navigationLabel = 'Analytics';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Analytics e Observabilidade';

    protected ?string $subheading = 'Acompanhe lucro, KPIs, preferências, ações e saúde do produto.';

    protected string $view = 'filament.pages.analytics-overview';

    #[Url(as: 'period', except: 'this_month')]
    public string $period = 'this_month';

    #[Url(as: 'tab', except: 'dashboard')]
    public string $activeTab = 'dashboard';

    #[Url(as: 'from')]
    public ?string $from = null;

    #[Url(as: 'to')]
    public ?string $to = null;

    #[Url(as: 'compare', except: false)]
    public bool $compareEnabled = false;

    #[Url(as: 'compare_from')]
    public ?string $compareFrom = null;

    #[Url(as: 'compare_to')]
    public ?string $compareTo = null;

    #[Url(as: 'q', except: '')]
    public string $operationalSearch = '';

    #[Url(as: 'type', except: '')]
    public string $operationalType = '';

    #[Url(as: 'source', except: '')]
    public string $operationalSource = '';

    public static function canAccess(): bool
    {
        return AdminAccess::isAdmin();
    }

    public function mount(): void
    {
        if (! array_key_exists($this->period, $this->periodOptions())) {
            $this->period = 'this_month';
        }

        if (! array_key_exists($this->activeTab, $this->tabOptions())) {
            $this->activeTab = 'dashboard';
        }

        if ($this->period === 'custom' && (blank($this->from) || blank($this->to))) {
            [$this->from, $this->to] = $this->defaultCustomDates();
        }

        if ($this->compareEnabled && (blank($this->compareFrom) || blank($this->compareTo))) {
            [$this->compareFrom, $this->compareTo] = $this->defaultComparisonDates();
        }
    }

    public function setPeriod(string $period): void
    {
        if (! array_key_exists($period, $this->periodOptions())) {
            return;
        }

        $this->period = $period;

        if ($period === 'custom') {
            [$this->from, $this->to] = [filled($this->from) ? $this->from : null, filled($this->to) ? $this->to : null];

            if (blank($this->from) || blank($this->to)) {
                [$this->from, $this->to] = $this->defaultCustomDates();
            }
        } else {
            $this->from = null;
            $this->to = null;
        }

        $this->resetPage();
    }

    public function setActiveTab(string $tab): void
    {
        if (array_key_exists($tab, $this->tabOptions())) {
            $this->activeTab = $tab;
            $this->resetPage();
        }
    }

    public function updatedFrom(): void
    {
        $this->period = 'custom';
        $this->resetPage();
    }

    public function updatedTo(): void
    {
        $this->period = 'custom';
        $this->resetPage();
    }

    public function updatedOperationalSearch(): void
    {
        $this->resetPage();
    }

    public function updatedOperationalType(): void
    {
        $this->resetPage();
    }

    public function updatedOperationalSource(): void
    {
        $this->resetPage();
    }

    public function toggleComparison(): void
    {
        $this->compareEnabled = ! $this->compareEnabled;

        if ($this->compareEnabled && (blank($this->compareFrom) || blank($this->compareTo))) {
            [$this->compareFrom, $this->compareTo] = $this->defaultComparisonDates();
        }
    }

    public function clearComparison(): void
    {
        $this->compareEnabled = false;
        $this->compareFrom = null;
        $this->compareTo = null;
    }

    /**
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        return app(AnalyticsMetrics::class)->adminDashboard(
            $this->period,
            $this->from,
            $this->to,
            [
                'enabled' => $this->compareEnabled,
                'from' => $this->compareFrom,
                'to' => $this->compareTo,
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function viewModel(): array
    {
        $dashboard = $this->dashboard();
        $health = $dashboard['health'];
        $operationalFeed = $this->operationalFeed($dashboard);

        return [
            'dashboard' => $dashboard,
            'tabs' => $this->tabs($dashboard, $operationalFeed),
            'kpiCards' => $this->kpiCards($dashboard),
            'trendCards' => $this->trendCards($dashboard),
            'preferenceSections' => $this->preferenceSections($dashboard['preferences']),
            'funnelSummary' => $this->funnelSummary($dashboard['funnel']),
            'healthCards' => $this->healthCards($health),
            'healthItems' => $this->healthItems($health),
            'pruneRows' => $this->pruneRows($health['prune_estimate_tables']),
            'commandCards' => $health['commands'],
            'operationalFeed' => $operationalFeed,
            'operationalTypeOptions' => $this->operationalTypeOptions(),
            'operationalSourceOptions' => $this->operationalSourceOptions(),
        ];
    }

    public function money(int|float $cents): string
    {
        return 'R$ '.number_format(((float) $cents) / 100, 2, ',', '.');
    }

    public function number(int|float $value): string
    {
        return number_format($value, is_float($value) && floor($value) !== $value ? 1 : 0, ',', '.');
    }

    public function percent(int|float|null $value): string
    {
        return $value === null ? 'N/D' : number_format((float) $value, 1, ',', '.').'%';
    }

    /**
     * @return array<string, string>
     */
    public function periodOptions(): array
    {
        return [
            'today' => 'Hoje',
            '7d' => '7 dias',
            'this_month' => 'Este mês',
            'custom' => 'Personalizado',
        ];
    }

    public function statusColor(string $status): string
    {
        return match ($status) {
            'paid', 'approved', 'published', 'ok', 'success' => 'success',
            'pending', 'pending_payment', 'needs_aggregation', 'processing' => 'warning',
            'rejected', 'failed', 'canceled', 'cancelled', 'expired', 'error' => 'danger',
            default => 'gray',
        };
    }

    public function rateColor(int|float|null $value): string
    {
        if ($value === null) {
            return 'gray';
        }

        return match (true) {
            $value >= 80 => 'success',
            $value >= 40 => 'warning',
            default => 'danger',
        };
    }

    public function eventLabel(string $event): string
    {
        return match ($event) {
            'landing_viewed' => 'Landing visualizada',
            'landing_cta_clicked' => 'CTA da landing',
            'create_flow_started' => 'Criação iniciada',
            'occasion_selected' => 'Ocasião selecionada',
            'template_list_viewed' => 'Lista de templates',
            'template_selected' => 'Template selecionado',
            'template_previewed' => 'Template pré-visualizado',
            'user_registered' => 'Usuário cadastrado',
            'user_logged_in' => 'Login realizado',
            'gift_draft_created' => 'Gift criado',
            'editor_opened' => 'Editor aberto',
            'preview_opened' => 'Preview aberto',
            'review_opened' => 'Revisão aberta',
            'checkout_opened' => 'Checkout aberto',
            'order_created' => 'Pedido criado',
            'payment_approved' => 'Pagamento aprovado',
            'order_paid' => 'Pedido pago',
            'gift_published' => 'Gift publicado',
            'public_gift_opened' => 'Viewer público aberto',
            'gift_completed' => 'Gift concluído',
            'envelope_opened' => 'Envelope aberto',
            'envelope_closed' => 'Envelope fechado',
            'polaroid_flipped' => 'Polaroid virada',
            'create_my_own_clicked' => 'CTA público clicado',
            'admin_asset_uploaded' => 'Asset enviado por admin',
            'admin_theme_updated' => 'Tema atualizado',
            'admin_template_published' => 'Template publicado',
            'admin_gift_converted_to_template' => 'Gift convertido em template',
            'autosave_error' => 'Erro de autosave',
            'upload_failed' => 'Falha de upload',
            'payment_webhook_failed' => 'Falha de webhook',
            'viewer_load_failed' => 'Falha no viewer',
            default => str($event)->replace('_', ' ')->headline()->toString(),
        };
    }

    private function operationalFeed(array $dashboard): LengthAwarePaginator
    {
        $period = $dashboard['period'];
        $range = [
            'from' => CarbonImmutable::parse((string) $period['from'])->startOfDay(),
            'to' => CarbonImmutable::parse((string) $period['to'])->endOfDay(),
        ];

        $feed = app(AnalyticsMetrics::class)->operationalFeed(
            $range,
            [
                'search' => $this->operationalSearch,
                'type' => $this->operationalType,
                'source' => $this->operationalSource,
            ],
            $this->getPage(),
            25,
        );

        $feed->setCollection($feed->getCollection()->map(fn (array $row): array => $this->operationalRow($row)));

        return $feed;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function kpiCards(array $dashboard): array
    {
        $overview = $dashboard['overview'];
        $revenue = $dashboard['revenue'];
        $comparison = $dashboard['comparison'];
        $compareOverview = $comparison['overview'] ?? [];
        $compareRevenue = $comparison['revenue'] ?? [];

        return [
            $this->kpiCard('Lucro bruto', $overview['revenue_total_cents'], $compareOverview['revenue_total_cents'] ?? null, 'money', 'Receita aprovada no período', Heroicon::OutlinedBanknotes, 'success'),
            $this->kpiCard('Pedidos pagos', $overview['paid_orders'], $compareOverview['paid_orders'] ?? null, 'number', 'Pedidos concluídos', Heroicon::OutlinedShoppingBag, 'primary'),
            $this->kpiCard('Ticket médio', $revenue['average_ticket_cents'], $compareRevenue['average_ticket_cents'] ?? null, 'money', 'Receita por pedido pago', Heroicon::OutlinedReceiptPercent, 'info'),
            $this->kpiCard('Taxa de aprovação', $revenue['approval_rate'], $compareRevenue['approval_rate'] ?? null, 'percent', 'Pagos / pedidos criados', Heroicon::OutlinedCheckCircle, $this->rateColor($revenue['approval_rate'])),
            $this->kpiCard('Checkout -> pago', $overview['checkout_to_paid_rate'], $compareOverview['checkout_to_paid_rate'] ?? null, 'percent', 'Conversão operacional', Heroicon::OutlinedChartBar, $this->rateColor($overview['checkout_to_paid_rate'])),
            $this->kpiCard('Gifts publicados', $overview['gifts_published'], $compareOverview['gifts_published'] ?? null, 'number', 'Links públicos liberados', Heroicon::OutlinedGift, 'success'),
            $this->kpiCard('Visitas públicas', $overview['public_visits'], $compareOverview['public_visits'] ?? null, 'number', 'Aberturas do viewer', Heroicon::OutlinedEye, 'info'),
            $this->kpiCard('Visitantes estimados', $overview['unique_visitors'], $compareOverview['unique_visitors'] ?? null, 'number', 'Sessões first-party', Heroicon::OutlinedUsers, 'warning'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function kpiCard(string $title, int|float $value, int|float|null $previous, string $format, string $description, string|BackedEnum $icon, string $color): array
    {
        return [
            'title' => $title,
            'value' => $this->formatValue($value, $format),
            'description' => $description,
            'icon' => $icon,
            'color' => $color,
            'delta' => $this->compareEnabled ? $this->delta($value, $previous, $format) : null,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function trendCards(array $dashboard): array
    {
        $comparisonDaily = $dashboard['comparison']['daily'] ?? [];

        return [
            [
                'title' => 'Lucro bruto',
                'description' => 'Receita aprovada por dia',
                'value' => $this->money($dashboard['overview']['revenue_total_cents']),
                'series' => $this->series($dashboard['daily']['revenue_by_day'], 'revenue_cents', 'money'),
                'comparison' => $this->series($comparisonDaily['revenue_by_day'] ?? [], 'revenue_cents', 'money'),
                'color' => 'success',
            ],
            [
                'title' => 'Pedidos pagos',
                'description' => 'Volume de compras aprovadas',
                'value' => $this->number($dashboard['overview']['paid_orders']),
                'series' => $this->series($dashboard['daily']['paid_orders_by_day'], 'orders', 'number'),
                'comparison' => $this->series($comparisonDaily['paid_orders_by_day'] ?? [], 'orders', 'number'),
                'color' => 'primary',
            ],
            [
                'title' => 'Visitas públicas',
                'description' => 'Aberturas dos presentes publicados',
                'value' => $this->number($dashboard['overview']['public_visits']),
                'series' => $this->series($dashboard['daily']['public_gift_opened_by_day'], 'opens', 'number'),
                'comparison' => $this->series($comparisonDaily['public_gift_opened_by_day'] ?? [], 'opens', 'number'),
                'color' => 'info',
            ],
        ];
    }

    /**
     * @return array<int, array{label: string, value: int|float, formatted: string}>
     */
    private function series(array $rows, string $valueKey, string $format): array
    {
        return collect($rows)
            ->map(fn (array $row): array => [
                'label' => $this->shortDate((string) ($row['date'] ?? '')),
                'value' => (int) ($row[$valueKey] ?? 0),
                'formatted' => $this->formatValue((int) ($row[$valueKey] ?? 0), $format),
            ])
            ->values()
            ->all();
    }

    /**
     * @param  array<string, array<int, array<string, mixed>>>  $preferences
     * @return array<int, array<string, mixed>>
     */
    private function preferenceSections(array $preferences): array
    {
        return [
            $this->preferenceSection('Templates', 'Escolhidos na criação e receita gerada.', $preferences['templates'] ?? [], 'primary'),
            $this->preferenceSection('Temas', 'Preferências visuais que mais puxam uso e compra.', $preferences['themes'] ?? [], 'info'),
            $this->preferenceSection('Ocasiões', 'Motivos mais escolhidos pelos clientes.', $preferences['occasions'] ?? [], 'warning'),
            $this->preferenceSection('Planos', 'Planos usados em gifts e pedidos pagos.', $preferences['plans'] ?? [], 'success'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function preferenceSection(string $title, string $description, array $items, string $color): array
    {
        $maxUsage = max([1, ...array_map(fn (array $item): int => (int) $item['usage_count'], $items)]);
        $totalUsage = max(1, array_sum(array_map(fn (array $item): int => (int) $item['usage_count'], $items)));

        return [
            'title' => $title,
            'description' => $description,
            'color' => $color,
            'items' => collect($items)
                ->map(fn (array $item): array => [
                    'label' => $item['name'],
                    'usage' => (int) $item['usage_count'],
                    'usage_label' => $this->number((int) $item['usage_count']).' escolhas',
                    'orders_label' => $this->number((int) $item['orders_count']).' pedidos',
                    'revenue_label' => $this->money((int) $item['revenue_cents']),
                    'share' => round((((int) $item['usage_count']) / $totalUsage) * 100, 1),
                    'bar' => round((((int) $item['usage_count']) / $maxUsage) * 100, 1),
                ])
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function funnelSummary(array $funnel): array
    {
        $criticalEvents = [
            'landing_viewed',
            'create_flow_started',
            'template_selected',
            'checkout_opened',
            'order_created',
            'payment_approved',
            'gift_published',
            'public_gift_opened',
        ];
        $rows = collect($funnel)
            ->filter(fn (array $step): bool => in_array($step['event'], $criticalEvents, true))
            ->map(fn (array $step): array => [
                'label' => $this->eventLabel($step['event']),
                'code' => $step['event'],
                'count' => (int) $step['count'],
                'count_label' => $this->number((int) $step['count']),
                'conversion_label' => $this->percent($step['conversion_from_previous']),
                'conversion_color' => $this->rateColor($step['conversion_from_previous']),
                'dropoff' => $step['dropoff_from_previous'],
                'dropoff_label' => $this->percent($step['dropoff_from_previous']),
            ])
            ->values();
        $worstDropoff = $rows
            ->filter(fn (array $row): bool => $row['dropoff'] !== null)
            ->sortByDesc('dropoff')
            ->first();

        return [
            'rows' => $rows->all(),
            'insight' => $worstDropoff
                ? 'Maior queda: '.$worstDropoff['label'].' ('.$worstDropoff['dropoff_label'].')'
                : 'O funil ainda precisa de eventos suficientes para calcular quedas.',
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function healthCards(array $health): array
    {
        return [
            ['title' => 'Status geral', 'value' => $health['status_label'], 'description' => $this->healthDescription($health['status']), 'icon' => Heroicon::OutlinedBolt, 'color' => $this->statusColor($health['status'])],
            ['title' => 'Último evento', 'value' => $health['last_event_at'] ?? 'N/D', 'description' => 'Atividade mais recente', 'icon' => Heroicon::OutlinedClipboardDocumentList, 'color' => filled($health['last_event_at'] ?? null) ? 'info' : 'gray'],
            ['title' => 'Última agregação', 'value' => $health['last_aggregated_date'] ?? 'N/D', 'description' => 'analytics_daily_metrics', 'icon' => Heroicon::OutlinedCalendarDays, 'color' => $health['status'] === 'needs_aggregation' ? 'warning' : 'success'],
            ['title' => 'Prune elegível', 'value' => $this->number($health['prune_estimate_total']), 'description' => 'Registros pela retenção', 'icon' => Heroicon::OutlinedCommandLine, 'color' => $health['prune_estimate_total'] > 0 ? 'warning' : 'success'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function healthItems(array $health): array
    {
        return [
            ['label' => 'analytics_sessions', 'value' => $this->number($health['sessions_count']), 'color' => 'primary'],
            ['label' => 'analytics_events', 'value' => $this->number($health['events_count']), 'color' => 'info'],
            ['label' => 'gift_visits', 'value' => $this->number($health['gift_visits_count']), 'color' => 'success'],
            ['label' => 'gift_events', 'value' => $this->number($health['gift_events_count']), 'color' => 'warning'],
            ['label' => 'analytics_daily_metrics', 'value' => $this->number($health['daily_metrics_count']), 'color' => 'gray'],
            ['label' => 'Último evento registrado', 'value' => $health['last_event_at'] ?? 'N/D', 'color' => filled($health['last_event_at'] ?? null) ? 'info' : 'gray'],
            ['label' => 'Última métrica diária', 'value' => $health['last_aggregated_date'] ?? 'N/D', 'color' => filled($health['last_aggregated_date'] ?? null) ? 'success' : 'gray'],
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function pruneRows(array $tables): array
    {
        return collect($tables)
            ->map(fn (int $count, string $table): array => [
                'label' => $table,
                'value' => $this->number($count),
                'meta' => $count > 0 ? 'elegíveis para retenção' : 'sem registros elegíveis',
                'color' => $count > 0 ? 'warning' : 'success',
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function tabs(array $dashboard, LengthAwarePaginator $operationalFeed): array
    {
        return [
            'dashboard' => [
                'label' => 'Dashboard',
                'icon' => Heroicon::OutlinedChartBar,
                'badge' => $this->money($dashboard['overview']['revenue_total_cents']),
                'badge_color' => 'success',
            ],
            'operational' => [
                'label' => 'Operacional',
                'icon' => Heroicon::OutlinedClipboardDocumentList,
                'badge' => $this->number($operationalFeed->total()),
                'badge_color' => $dashboard['error_events'] === [] ? 'gray' : 'danger',
            ],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function tabOptions(): array
    {
        return [
            'dashboard' => ['label' => 'Dashboard'],
            'operational' => ['label' => 'Operacional'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function operationalTypeOptions(): array
    {
        return [
            '' => 'Todos os tipos',
            'payment' => 'Pagamentos',
            'checkout' => 'Checkout',
            'creation' => 'Criação',
            'viewer' => 'Viewer',
            'admin' => 'Admin',
            'system' => 'Sistema',
            'error' => 'Erros',
            'activity' => 'Activity log',
        ];
    }

    /**
     * @return array<string, string>
     */
    private function operationalSourceOptions(): array
    {
        return [
            '' => 'Todas as origens',
            'server' => 'Server',
            'client' => 'Client',
            'browser' => 'Browser',
            'system' => 'System',
            'admin' => 'Admin',
            'qr' => 'QR Code',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function operationalRow(array $row): array
    {
        $type = (string) ($row['type'] ?? '');
        $origin = (string) ($row['origin'] ?? '');
        $isAnalytics = ($row['kind'] ?? '') === 'analytics';

        return [
            ...$row,
            'title' => $isAnalytics ? $this->eventLabel((string) $row['title']) : (string) $row['title'],
            'code' => (string) ($row['code'] ?? ''),
            'type_label' => $type === 'activity' ? 'Activity log' : str($type)->headline()->toString(),
            'type_color' => $this->groupColor($type),
            'origin_label' => $origin !== '' ? str($origin)->replace('_', ' ')->headline()->toString() : 'N/D',
            'origin_color' => $this->sourceColor($origin),
        ];
    }

    private function delta(int|float $current, int|float|null $previous, string $format): ?array
    {
        if ($previous === null) {
            return null;
        }

        $absolute = $current - $previous;
        $direction = $absolute > 0 ? 'up' : ($absolute < 0 ? 'down' : 'flat');
        $relative = $previous == 0
            ? ($current == 0 ? 0.0 : 100.0)
            : round(($absolute / abs((float) $previous)) * 100, 1);

        return [
            'label' => $this->signedValue($absolute, $format),
            'meta' => ($relative > 0 ? '+' : '').number_format($relative, 1, ',', '.').'% vs comparação',
            'direction' => $direction,
            'color' => match ($direction) {
                'up' => 'success',
                'down' => 'danger',
                default => 'gray',
            },
        ];
    }

    private function signedValue(int|float $value, string $format): string
    {
        $prefix = $value > 0 ? '+' : ($value < 0 ? '-' : '');
        $absolute = abs((float) $value);

        return match ($format) {
            'money' => $prefix.$this->money($absolute),
            'percent' => $prefix.number_format($absolute, 1, ',', '.').' p.p.',
            default => $prefix.$this->number($absolute),
        };
    }

    private function formatValue(int|float $value, string $format): string
    {
        return match ($format) {
            'money' => $this->money($value),
            'percent' => $this->percent($value),
            default => $this->number($value),
        };
    }

    private function shortDate(string $date): string
    {
        try {
            return CarbonImmutable::parse($date)->format('d/m');
        } catch (Throwable) {
            return $date;
        }
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function defaultCustomDates(): array
    {
        $now = CarbonImmutable::now();

        return [$now->startOfMonth()->toDateString(), $now->toDateString()];
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function defaultComparisonDates(): array
    {
        [$from, $to] = $this->currentRangeDates();
        $days = max(1, $from->diffInDays($to) + 1);
        $compareTo = $from->subDay();
        $compareFrom = $compareTo->subDays($days - 1);

        return [$compareFrom->toDateString(), $compareTo->toDateString()];
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function currentRangeDates(): array
    {
        $now = CarbonImmutable::now();

        if ($this->period === 'custom') {
            $from = $this->parseDate($this->from) ?? $now->startOfMonth();
            $to = $this->parseDate($this->to) ?? $now;

            return $from->gt($to) ? [$to, $from] : [$from, $to];
        }

        return match ($this->period) {
            'today' => [$now->startOfDay(), $now->endOfDay()],
            '7d' => [$now->subDays(6)->startOfDay(), $now->endOfDay()],
            default => [$now->startOfMonth(), $now->endOfDay()],
        };
    }

    private function parseDate(?string $date): ?CarbonImmutable
    {
        if (blank($date)) {
            return null;
        }

        try {
            return CarbonImmutable::parse($date);
        } catch (Throwable) {
            return null;
        }
    }

    private function healthDescription(string $status): string
    {
        return match ($status) {
            'ok' => 'Eventos e agregações em dia',
            'needs_aggregation' => 'Há dados brutos aguardando agregação',
            default => 'Aguardando primeiros eventos',
        };
    }

    private function groupColor(string $group): string
    {
        return match ($group) {
            'payment', 'publication', 'viewer', 'activity' => 'success',
            'checkout', 'creation', 'marketing' => 'primary',
            'editor', 'media', 'share' => 'info',
            'system', 'auth', 'admin' => 'warning',
            'error' => 'danger',
            default => 'gray',
        };
    }

    private function sourceColor(string $source): string
    {
        return match ($source) {
            'client', 'browser', 'qr' => 'primary',
            'server', 'system' => 'gray',
            'admin' => 'warning',
            'share_card', 'copy_link', 'link' => 'info',
            'direct' => 'success',
            default => 'gray',
        };
    }
}
