<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Enums\PaymentStatus;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class AnalyticsDailyAggregator
{
    public function __construct(private AnalyticsMetricWriter $writer) {}

    /**
     * @return array{from: string, to: string, dates: int, metrics_written: int, errors: array<int, array{date: string, group: string, message: string}>}
     */
    public function aggregateRange(CarbonInterface|string $from, CarbonInterface|string $to, bool $force = false): array
    {
        $fromDate = $this->parseDate($from);
        $toDate = $this->parseDate($to);

        if ($toDate->lessThan($fromDate)) {
            [$fromDate, $toDate] = [$toDate, $fromDate];
        }

        $metricsWritten = 0;
        $dates = 0;
        $errors = [];

        for ($date = $fromDate; $date->lessThanOrEqualTo($toDate); $date = $date->addDay()) {
            $result = $this->aggregateDate($date, $force);
            $metricsWritten += $result['metrics_written'];
            $errors = [...$errors, ...$result['errors']];
            $dates++;
        }

        return [
            'from' => $fromDate->toDateString(),
            'to' => $toDate->toDateString(),
            'dates' => $dates,
            'metrics_written' => $metricsWritten,
            'errors' => $errors,
        ];
    }

    /**
     * @return array{date: string, metrics_written: int, errors: array<int, array{date: string, group: string, message: string}>}
     */
    public function aggregateDate(CarbonInterface|string $date, bool $force = false): array
    {
        $date = $this->parseDate($date);

        if ($force) {
            $this->writer->deleteForDate($date);
        }

        $metricsWritten = 0;
        $errors = [];
        $groups = [
            'product' => fn (): int => $this->aggregateProduct($date),
            'funnel' => fn (): int => $this->aggregateFunnel($date),
            'viewer' => fn (): int => $this->aggregateViewer($date),
            'share' => fn (): int => $this->aggregateShare($date),
            'finance' => fn (): int => $this->aggregateFinance($date),
        ];

        foreach ($groups as $group => $callback) {
            try {
                $metricsWritten += $callback();
            } catch (Throwable $exception) {
                report($exception);

                Log::warning('Analytics daily aggregation group failed.', [
                    'date' => $date->toDateString(),
                    'group' => $group,
                    'message' => $exception->getMessage(),
                ]);

                $errors[] = [
                    'date' => $date->toDateString(),
                    'group' => $group,
                    'message' => $exception->getMessage(),
                ];
            }
        }

        return [
            'date' => $date->toDateString(),
            'metrics_written' => $metricsWritten,
            'errors' => $errors,
        ];
    }

    private function aggregateProduct(CarbonImmutable $date): int
    {
        $written = 0;

        $written += $this->writeMetric($date, 'sessions_total', $this->sessionsOn($date)->count());
        $written += $this->writeDimensionCounts($date, 'sessions_total', $this->sessionsOn($date), 'device_type', 'device_type');

        $written += $this->writeMetric($date, 'visitors_estimated', $this->sessionsOn($date)->distinct('session_uuid')->count('session_uuid'));
        $written += $this->writeMetric($date, 'users_registered', $this->eventCount($date, AnalyticsEventName::UserRegistered));
        $written += $this->writeMetric($date, 'gifts_created', $this->giftsCreatedOn($date)->count());
        $written += $this->writeGiftDimensionCounts($date, 'gifts_created', $this->giftsCreatedOn($date));
        $written += $this->writeMetric($date, 'gifts_published', $this->giftsPublishedOn($date)->count());
        $written += $this->writeGiftDimensionCounts($date, 'gifts_published', $this->giftsPublishedOn($date));
        $written += $this->writeMetric($date, 'templates_selected', $this->eventCount($date, AnalyticsEventName::TemplateSelected));
        $written += $this->writeDimensionCounts($date, 'templates_selected', $this->eventsOn($date)->where('event_name', AnalyticsEventName::TemplateSelected->value), 'template_version_id', 'template_version_id');
        $written += $this->writeMetric($date, 'editor_opened', $this->eventCount($date, AnalyticsEventName::EditorOpened));
        $written += $this->writeMetric($date, 'preview_opened', $this->eventCount($date, AnalyticsEventName::PreviewOpened));
        $written += $this->writeMetric($date, 'review_opened', $this->eventCount($date, AnalyticsEventName::ReviewOpened));
        $written += $this->writeDimensionCounts($date, 'events_total', $this->eventsOn($date), 'event_group', 'event_group');

        return $written;
    }

    private function aggregateFunnel(CarbonImmutable $date): int
    {
        $written = 0;
        $events = [
            'funnel_landing_viewed' => AnalyticsEventName::LandingViewed,
            'funnel_create_started' => AnalyticsEventName::CreateFlowStarted,
            'funnel_occasion_selected' => AnalyticsEventName::OccasionSelected,
            'funnel_template_selected' => AnalyticsEventName::TemplateSelected,
            'funnel_gift_created' => AnalyticsEventName::GiftDraftCreated,
            'funnel_editor_opened' => AnalyticsEventName::EditorOpened,
            'funnel_review_opened' => AnalyticsEventName::ReviewOpened,
            'funnel_checkout_opened' => AnalyticsEventName::CheckoutOpened,
            'funnel_order_created' => AnalyticsEventName::OrderCreated,
            'funnel_payment_approved' => AnalyticsEventName::PaymentApproved,
            'funnel_gift_published' => AnalyticsEventName::GiftPublished,
            'funnel_public_gift_opened' => AnalyticsEventName::PublicGiftOpened,
        ];

        foreach ($events as $metricKey => $event) {
            $written += $this->writeMetric($date, $metricKey, $this->eventCount($date, $event));
        }

        return $written;
    }

    private function aggregateViewer(CarbonImmutable $date): int
    {
        $written = 0;

        $written += $this->writeMetric($date, 'public_gift_opened', $this->giftVisitsOn($date)->count());
        $written += $this->writeDimensionCounts($date, 'public_gift_opened', $this->giftVisitsOn($date), 'public_source', 'source', 'unknown');
        $written += $this->writeDimensionCounts($date, 'public_gift_opened', $this->giftVisitsOn($date), 'device_type', 'device_type');
        $written += $this->writeMetric($date, 'gift_page_viewed', $this->giftEventCount($date, AnalyticsEventName::GiftPageViewed));
        $written += $this->writeMetric($date, 'gift_completed', $this->giftEventCount($date, AnalyticsEventName::GiftCompleted));
        $written += $this->writeMetric($date, 'envelope_opened', $this->giftEventCount($date, AnalyticsEventName::EnvelopeOpened));
        $written += $this->writeMetric($date, 'polaroid_flipped', $this->giftEventCount($date, AnalyticsEventName::PolaroidFlipped));
        $written += $this->writeMetric($date, 'create_my_own_clicked', $this->giftEventCount($date, AnalyticsEventName::CreateMyOwnClicked));

        return $written;
    }

    private function aggregateShare(CarbonImmutable $date): int
    {
        $written = 0;
        $events = [
            'share_page_opened' => AnalyticsEventName::SharePageOpened,
            'public_link_copied' => AnalyticsEventName::PublicLinkCopied,
            'qr_code_viewed' => AnalyticsEventName::QrCodeViewed,
            'qr_code_downloaded' => AnalyticsEventName::QrCodeDownloaded,
            'share_card_opened' => AnalyticsEventName::ShareCardOpened,
            'share_card_print_clicked' => AnalyticsEventName::ShareCardPrintClicked,
        ];

        foreach ($events as $metricKey => $event) {
            $written += $this->writeMetric($date, $metricKey, $this->eventCount($date, $event));
        }

        return $written;
    }

    private function aggregateFinance(CarbonImmutable $date): int
    {
        $paidOrders = $this->ordersPaidOn($date);
        $paidOrdersCount = (clone $paidOrders)->count();
        $revenueCents = (int) (clone $paidOrders)->sum('amount_cents');
        $written = 0;

        $written += $this->writeMetric($date, 'revenue_approved_cents', $revenueCents);
        $written += $this->writeDimensionSums($date, 'revenue_approved_cents', $this->ordersPaidOn($date), 'plan_id', 'plan_id', 'amount_cents');
        $written += $this->writeMetric($date, 'orders_created', $this->ordersCreatedOn($date)->count());
        $written += $this->writeDimensionCounts($date, 'orders_created', $this->ordersCreatedOn($date), 'plan_id', 'plan_id');
        $written += $this->writeMetric($date, 'orders_paid', $paidOrdersCount);
        $written += $this->writeDimensionCounts($date, 'orders_paid', $this->ordersPaidOn($date), 'plan_id', 'plan_id');
        $written += $this->writeMetric($date, 'payments_approved', $this->paymentsOn($date)->where('status', PaymentStatus::Approved->value)->count());
        $written += $this->writeMetric($date, 'payments_rejected', $this->paymentsOn($date)->where('status', PaymentStatus::Rejected->value)->count());
        $written += $this->writeMetric($date, 'average_ticket_cents', $paidOrdersCount > 0 ? (int) round($revenueCents / $paidOrdersCount) : 0);

        return $written;
    }

    private function writeMetric(CarbonImmutable $date, string $metricKey, int|float $value): int
    {
        $this->writer->write($date, $metricKey, $value, [], $this->metadata());

        return 1;
    }

    /**
     * @param  Builder<*>  $query
     */
    private function writeDimensionCounts(
        CarbonImmutable $date,
        string $metricKey,
        Builder $query,
        string $column,
        string $dimensionKey,
        ?string $nullLabel = null,
    ): int {
        $quotedNullLabel = $nullLabel === null ? null : str_replace("'", "''", $nullLabel);
        $select = $nullLabel === null
            ? "{$column} as dimension_value"
            : "COALESCE({$column}, '{$quotedNullLabel}') as dimension_value";
        $groupBy = $nullLabel === null
            ? $column
            : "COALESCE({$column}, '{$quotedNullLabel}')";
        $rows = $query
            ->when($nullLabel === null, fn (Builder $query) => $query->whereNotNull($column))
            ->selectRaw($select.', COUNT(*) as aggregate_value')
            ->groupByRaw($groupBy)
            ->get();

        $written = 0;

        foreach ($rows as $row) {
            $this->writer->write($date, $metricKey, (int) $row->aggregate_value, [
                $dimensionKey => (string) $row->dimension_value,
            ], $this->metadata());
            $written++;
        }

        return $written;
    }

    /**
     * @param  Builder<*>  $query
     */
    private function writeDimensionSums(
        CarbonImmutable $date,
        string $metricKey,
        Builder $query,
        string $column,
        string $dimensionKey,
        string $sumColumn,
    ): int {
        $rows = $query
            ->whereNotNull($column)
            ->selectRaw("{$column} as dimension_value, SUM({$sumColumn}) as aggregate_value")
            ->groupBy($column)
            ->get();
        $written = 0;

        foreach ($rows as $row) {
            $this->writer->write($date, $metricKey, (int) $row->aggregate_value, [
                $dimensionKey => (string) $row->dimension_value,
            ], $this->metadata());
            $written++;
        }

        return $written;
    }

    /**
     * @param  Builder<Gift>  $query
     */
    private function writeGiftDimensionCounts(CarbonImmutable $date, string $metricKey, Builder $query): int
    {
        $written = 0;

        foreach (['template_version_id', 'theme_version_id', 'occasion_id', 'plan_id'] as $column) {
            $written += $this->writeDimensionCounts($date, $metricKey, clone $query, $column, $column);
        }

        return $written;
    }

    private function eventCount(CarbonImmutable $date, AnalyticsEventName $event): int
    {
        return $this->eventsOn($date)->where('event_name', $event->value)->count();
    }

    private function giftEventCount(CarbonImmutable $date, AnalyticsEventName $event): int
    {
        return $this->giftEventsOn($date)->where('event_name', $event->value)->count();
    }

    /**
     * @return Builder<AnalyticsEvent>
     */
    private function eventsOn(CarbonImmutable $date): Builder
    {
        return AnalyticsEvent::query()->whereBetween('occurred_at', $this->bounds($date));
    }

    /**
     * @return Builder<AnalyticsSession>
     */
    private function sessionsOn(CarbonImmutable $date): Builder
    {
        return AnalyticsSession::query()->whereBetween('first_seen_at', $this->bounds($date));
    }

    /**
     * @return Builder<Gift>
     */
    private function giftsCreatedOn(CarbonImmutable $date): Builder
    {
        return Gift::query()->whereBetween('created_at', $this->bounds($date));
    }

    /**
     * @return Builder<Gift>
     */
    private function giftsPublishedOn(CarbonImmutable $date): Builder
    {
        return Gift::query()
            ->whereNotNull('published_at')
            ->whereBetween('published_at', $this->bounds($date));
    }

    /**
     * @return Builder<GiftVisit>
     */
    private function giftVisitsOn(CarbonImmutable $date): Builder
    {
        return GiftVisit::query()->whereBetween('opened_at', $this->bounds($date));
    }

    /**
     * @return Builder<GiftEvent>
     */
    private function giftEventsOn(CarbonImmutable $date): Builder
    {
        return GiftEvent::query()->whereBetween('occurred_at', $this->bounds($date));
    }

    /**
     * @return Builder<Order>
     */
    private function ordersCreatedOn(CarbonImmutable $date): Builder
    {
        return Order::query()->whereBetween('created_at', $this->bounds($date));
    }

    /**
     * @return Builder<Order>
     */
    private function ordersPaidOn(CarbonImmutable $date): Builder
    {
        return Order::query()
            ->where('status', OrderStatus::Paid->value)
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', $this->bounds($date));
    }

    /**
     * @return Builder<Payment>
     */
    private function paymentsOn(CarbonImmutable $date): Builder
    {
        [$start, $end] = $this->bounds($date);

        return Payment::query()
            ->where(function (Builder $query) use ($start, $end): void {
                $query
                    ->whereBetween('processed_at', [$start, $end])
                    ->orWhere(function (Builder $query) use ($start, $end): void {
                        $query->whereNull('processed_at')->whereBetween('created_at', [$start, $end]);
                    });
            });
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function bounds(CarbonImmutable $date): array
    {
        return [$date->startOfDay(), $date->endOfDay()];
    }

    private function parseDate(CarbonInterface|string $date): CarbonImmutable
    {
        if ($date instanceof CarbonInterface) {
            return CarbonImmutable::instance($date)->startOfDay();
        }

        return CarbonImmutable::createFromFormat('Y-m-d', $date)->startOfDay();
    }

    /**
     * @return array<string, mixed>
     */
    private function metadata(): array
    {
        return [
            'aggregation_version' => 1,
            'aggregated_at' => now()->toDateTimeString(),
        ];
    }
}
