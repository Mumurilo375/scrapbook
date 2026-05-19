<?php

namespace App\Domain\Analytics\Services;

use App\Domain\Analytics\Models\AnalyticsDailyMetric;
use BackedEnum;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

final class AnalyticsMetricWriter
{
    /**
     * @param  array<string, mixed>  $dimensions
     * @param  array<string, mixed>|null  $metadata
     */
    public function write(
        CarbonInterface|string $date,
        string $metricKey,
        int|float|string $value,
        array $dimensions = [],
        ?array $metadata = null,
    ): AnalyticsDailyMetric {
        $dateString = $this->dateString($date);
        $normalizedDimensions = $this->normalizeDimensions($dimensions);
        $dimensionsHash = $this->dimensionsHash($normalizedDimensions);

        return AnalyticsDailyMetric::query()->updateOrCreate(
            [
                'date' => $dateString,
                'metric_key' => $metricKey,
                'dimensions_hash' => $dimensionsHash,
            ],
            [
                'dimensions' => $normalizedDimensions === [] ? null : $normalizedDimensions,
                'value_numeric' => $this->normalizeValue($value),
                'metadata' => $metadata,
            ],
        );
    }

    public function deleteForDate(CarbonInterface|string $date): int
    {
        return AnalyticsDailyMetric::query()
            ->whereDate('date', $this->dateString($date))
            ->delete();
    }

    public function deleteForRange(CarbonInterface|string $from, CarbonInterface|string $to): int
    {
        return AnalyticsDailyMetric::query()
            ->whereBetween('date', [$this->dateString($from), $this->dateString($to)])
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $dimensions
     * @return array<string, string|int|bool>
     */
    public function normalizeDimensions(array $dimensions): array
    {
        $normalized = [];

        foreach ($dimensions as $key => $value) {
            if (! is_string($key) || trim($key) === '' || $value === null || $value === '') {
                continue;
            }

            if ($value instanceof BackedEnum) {
                $value = $value->value;
            }

            if (is_bool($value) || is_int($value)) {
                $normalized[$key] = $value;

                continue;
            }

            if (is_float($value)) {
                $normalized[$key] = (string) $value;

                continue;
            }

            if (is_string($value) || is_numeric($value)) {
                $normalized[$key] = (string) $value;
            }
        }

        ksort($normalized);

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $dimensions
     */
    public function dimensionsHash(array $dimensions): string
    {
        $normalized = $this->normalizeDimensions($dimensions);
        $json = json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        return hash('sha256', is_string($json) ? $json : '{}');
    }

    private function dateString(CarbonInterface|string $date): string
    {
        if ($date instanceof CarbonInterface) {
            return CarbonImmutable::instance($date)->toDateString();
        }

        return CarbonImmutable::parse($date)->toDateString();
    }

    private function normalizeValue(int|float|string $value): string
    {
        if (is_string($value) && is_numeric($value)) {
            $value = (float) $value;
        }

        if (is_int($value)) {
            return (string) $value;
        }

        if (is_float($value)) {
            return (string) round($value, 2);
        }

        return is_numeric($value) ? (string) $value : '0';
    }
}
