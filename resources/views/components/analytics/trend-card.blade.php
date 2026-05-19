@props([
    'title' => '',
    'description' => null,
    'value' => '',
    'series' => [],
    'comparison' => [],
    'color' => 'primary',
])

@php
    $palette = match ($color) {
        'success' => ['stroke' => '#10b981', 'soft' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20'],
        'info' => ['stroke' => '#0ea5e9', 'soft' => 'bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20'],
        'warning' => ['stroke' => '#f59e0b', 'soft' => 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20'],
        default => ['stroke' => '#6366f1', 'soft' => 'bg-primary-50 text-primary-700 ring-primary-600/10 dark:bg-primary-400/10 dark:text-primary-300 dark:ring-primary-400/20'],
    };
    $currentValues = collect($series)->pluck('value')->map(fn ($value) => (float) $value)->values();
    $comparisonValues = collect($comparison)->pluck('value')->map(fn ($value) => (float) $value)->values();
    $allValues = $currentValues->merge($comparisonValues);
    $maxValue = max(1, (float) ($allValues->max() ?? 0));
    $width = 420;
    $height = 136;
    $padding = 14;
    $points = function ($values) use ($width, $height, $padding, $maxValue): string {
        $count = max(1, $values->count() - 1);

        return $values
            ->map(function (float $value, int $index) use ($width, $height, $padding, $maxValue, $count): string {
                $x = $padding + (($width - ($padding * 2)) * ($count === 0 ? 0.5 : $index / $count));
                $y = ($height - $padding) - (($height - ($padding * 2)) * ($value / $maxValue));

                return number_format($x, 1, '.', '').','.number_format($y, 1, '.', '');
            })
            ->implode(' ');
    };
    $currentPoints = $points($currentValues);
    $comparisonPoints = $points($comparisonValues);
@endphp

<div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
    <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ $title }}</p>

            @if (filled($description))
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ $description }}</p>
            @endif
        </div>

        <span class="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 {{ $palette['soft'] }}">
            {{ $value }}
        </span>
    </div>

    @if ($currentValues->isEmpty())
        <x-analytics.empty-state
            title="Sem dados para o gráfico."
            description="A série aparece quando houver atividade no período selecionado."
        />
    @else
        <div class="mt-5 overflow-hidden rounded-lg bg-gray-50 p-3 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
            <svg class="h-36 w-full" viewBox="0 0 {{ $width }} {{ $height }}" role="img" aria-label="{{ $title }}">
                <line x1="{{ $padding }}" y1="{{ $height - $padding }}" x2="{{ $width - $padding }}" y2="{{ $height - $padding }}" stroke="currentColor" class="text-gray-200 dark:text-white/10" stroke-width="1" />

                @if ($comparisonValues->isNotEmpty())
                    <polyline points="{{ $comparisonPoints }}" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5 5" />
                @endif

                <polyline points="{{ $currentPoints }}" fill="none" stroke="{{ $palette['stroke'] }}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>

            <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{{ $series[0]['label'] ?? '' }}</span>
                <span>{{ $series[count($series) - 1]['label'] ?? '' }}</span>
            </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full" style="background: {{ $palette['stroke'] }}"></span>Período atual</span>
            @if ($comparisonValues->isNotEmpty())
                <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-slate-400"></span>Comparação</span>
            @endif
        </div>
    @endif
</div>
