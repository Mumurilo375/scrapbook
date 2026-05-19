@props([
    'title' => '',
    'description' => null,
    'items' => [],
    'color' => 'primary',
])

@php
    $palette = match ($color) {
        'success' => ['accent' => '#10b981', 'bar' => 'bg-emerald-500', 'soft' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20'],
        'info' => ['accent' => '#0ea5e9', 'bar' => 'bg-sky-500', 'soft' => 'bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20'],
        'warning' => ['accent' => '#f59e0b', 'bar' => 'bg-amber-500', 'soft' => 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20'],
        default => ['accent' => '#6366f1', 'bar' => 'bg-primary-500', 'soft' => 'bg-primary-50 text-primary-700 ring-primary-600/10 dark:bg-primary-400/10 dark:text-primary-300 dark:ring-primary-400/20'],
    };
    $colors = ['#6366f1', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];
    $start = 0.0;
    $segments = [];

    foreach ($items as $index => $item) {
        $degrees = min(360, max(0, ((float) ($item['share'] ?? 0)) * 3.6));
        $end = min(360, $start + $degrees);

        if ($end > $start) {
            $segments[] = ($colors[$index % count($colors)]).' '.$start.'deg '.$end.'deg';
        }

        $start = $end;
    }

    if ($start < 360) {
        $segments[] = '#e5e7eb '.$start.'deg 360deg';
    }

    $gradient = 'conic-gradient('.implode(', ', $segments).')';
@endphp

<div class="rounded-lg bg-white p-5 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
    <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ $title }}</p>

            @if (filled($description))
                <p class="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{{ $description }}</p>
            @endif
        </div>

        @if ($items !== [])
            <div class="relative h-14 w-14 shrink-0 rounded-full" style="background: {{ $gradient }}">
                <div class="absolute inset-3 rounded-full bg-white dark:bg-gray-900"></div>
            </div>
        @endif
    </div>

    <div class="mt-5 grid gap-3">
        @forelse ($items as $item)
            <div class="grid gap-2">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{{ $item['label'] }}</p>
                        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {{ $item['usage_label'] }} · {{ $item['orders_label'] }}
                        </p>
                    </div>

                    <span class="shrink-0 rounded-md px-2 py-1 text-xs font-semibold ring-1 {{ $palette['soft'] }}">
                        {{ $item['revenue_label'] }}
                    </span>
                </div>

                <div class="h-2 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-950/5 dark:bg-white/10 dark:ring-white/10">
                    <div class="h-full rounded-full {{ $palette['bar'] }}" style="width: {{ max(2, min(100, (float) $item['bar'])) }}%"></div>
                </div>
            </div>
        @empty
            <x-analytics.empty-state
                title="Sem dados neste período."
                description="Os rankings aparecem quando gifts e pedidos começarem a usar esta dimensão."
            />
        @endforelse
    </div>
</div>
