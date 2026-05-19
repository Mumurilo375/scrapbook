<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Enums\AnalyticsEventGroup;
use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsDailyMetric;
use App\Domain\Analytics\Models\AnalyticsEvent;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

final class AnalyticsPruner
{
    private const CHUNK_SIZE = 500;

    /**
     * @return array<string, mixed>
     */
    public function estimate(): array
    {
        $tables = [
            'analytics_events' => $this->prunableAnalyticsEvents()->count(),
            'analytics_sessions' => $this->prunableAnalyticsSessions()->count(),
            'gift_visits' => $this->prunableGiftVisits()->count(),
            'gift_events' => $this->prunableGiftEvents()->count(),
            'analytics_daily_metrics' => $this->prunableDailyMetrics()->count(),
        ];

        return [
            'tables' => $tables,
            'total' => array_sum($tables),
            'cutoffs' => $this->cutoffs(),
            'keep_financial_events_forever' => $this->keepFinancialEventsForever(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function prune(bool $dryRun = false): array
    {
        $estimate = $this->estimate();

        if ($dryRun) {
            return [
                ...$estimate,
                'dry_run' => true,
                'deleted' => array_fill_keys(array_keys($estimate['tables']), 0),
            ];
        }

        $deleted = [
            'analytics_events' => $this->deleteInChunks($this->prunableAnalyticsEvents(), AnalyticsEvent::class),
            'analytics_sessions' => $this->deleteInChunks($this->prunableAnalyticsSessions(), AnalyticsSession::class),
            'gift_visits' => $this->deleteInChunks($this->prunableGiftVisits(), GiftVisit::class),
            'gift_events' => $this->deleteInChunks($this->prunableGiftEvents(), GiftEvent::class),
            'analytics_daily_metrics' => $this->deleteInChunks($this->prunableDailyMetrics(), AnalyticsDailyMetric::class),
        ];

        return [
            ...$estimate,
            'dry_run' => false,
            'deleted' => $deleted,
            'deleted_total' => array_sum($deleted),
        ];
    }

    /**
     * @return Builder<AnalyticsEvent>
     */
    public function prunableAnalyticsEvents(): Builder
    {
        $query = AnalyticsEvent::query()
            ->where('occurred_at', '<', $this->cutoff('events_retention_days'));

        if ($this->keepFinancialEventsForever()) {
            $query
                ->whereNull('order_id')
                ->whereNull('payment_id')
                ->whereNotIn('event_group', [
                    AnalyticsEventGroup::Checkout->value,
                    AnalyticsEventGroup::Payment->value,
                ])
                ->whereNotIn('event_name', $this->financialEventNames());
        }

        return $query;
    }

    /**
     * @return Builder<AnalyticsSession>
     */
    public function prunableAnalyticsSessions(): Builder
    {
        $cutoff = $this->cutoff('sessions_retention_days');

        return AnalyticsSession::query()
            ->where(function (Builder $query) use ($cutoff): void {
                $query
                    ->where('last_seen_at', '<', $cutoff)
                    ->orWhere(function (Builder $query) use ($cutoff): void {
                        $query->whereNull('last_seen_at')->where('created_at', '<', $cutoff);
                    });
            });
    }

    /**
     * @return Builder<GiftVisit>
     */
    public function prunableGiftVisits(): Builder
    {
        return GiftVisit::query()
            ->where('opened_at', '<', $this->cutoff('gift_visits_retention_days'));
    }

    /**
     * @return Builder<GiftEvent>
     */
    public function prunableGiftEvents(): Builder
    {
        return GiftEvent::query()
            ->where('occurred_at', '<', $this->cutoff('gift_events_retention_days'));
    }

    /**
     * @return Builder<AnalyticsDailyMetric>
     */
    public function prunableDailyMetrics(): Builder
    {
        return AnalyticsDailyMetric::query()
            ->whereDate('date', '<', $this->cutoff('daily_metrics_retention_days')->toDateString());
    }

    /**
     * @return array<string, string>
     */
    private function cutoffs(): array
    {
        return [
            'analytics_events' => $this->cutoff('events_retention_days')->toDateTimeString(),
            'analytics_sessions' => $this->cutoff('sessions_retention_days')->toDateTimeString(),
            'gift_visits' => $this->cutoff('gift_visits_retention_days')->toDateTimeString(),
            'gift_events' => $this->cutoff('gift_events_retention_days')->toDateTimeString(),
            'analytics_daily_metrics' => $this->cutoff('daily_metrics_retention_days')->toDateString(),
        ];
    }

    private function cutoff(string $configKey): CarbonImmutable
    {
        $days = max(1, (int) config("scrapbook.analytics.{$configKey}", 365));

        return CarbonImmutable::now()->subDays($days);
    }

    private function keepFinancialEventsForever(): bool
    {
        return (bool) config('scrapbook.analytics.keep_financial_events_forever', true);
    }

    /**
     * @return array<int, string>
     */
    private function financialEventNames(): array
    {
        return [
            AnalyticsEventName::GiftSentToCheckout->value,
            AnalyticsEventName::OrderCreated->value,
            AnalyticsEventName::PaymentPending->value,
            AnalyticsEventName::PaymentApproved->value,
            AnalyticsEventName::PaymentRejected->value,
            AnalyticsEventName::PaymentExpired->value,
            AnalyticsEventName::OrderPaid->value,
            AnalyticsEventName::OrderCanceled->value,
        ];
    }

    /**
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $query
     * @param  class-string<TModel>  $modelClass
     */
    private function deleteInChunks(Builder $query, string $modelClass): int
    {
        $deleted = 0;

        do {
            $ids = (clone $query)
                ->orderBy('id')
                ->limit(self::CHUNK_SIZE)
                ->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $deleted += $modelClass::query()
                ->whereIn('id', $ids->all())
                ->delete();
        } while ($ids->isNotEmpty());

        return $deleted;
    }
}
