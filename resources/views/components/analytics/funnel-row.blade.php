@props(['row'])

@php
    $barColor = match ($row['status_color']) {
        'success' => 'bg-emerald-500',
        'warning' => 'bg-amber-500',
        'danger' => 'bg-red-500',
        'info' => 'bg-sky-500',
        'primary' => 'bg-primary-500',
        default => 'bg-gray-300 dark:bg-gray-600',
    };

    $progress = max(0, min(100, (float) $row['progress']));
@endphp

<div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_8rem_minmax(12rem,1fr)_12rem] lg:items-center">
        <div class="min-w-0">
            <div class="flex items-center gap-3">
                <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-sm font-semibold text-gray-700 ring-1 ring-gray-950/10 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10">
                    {{ $row['step'] }}
                </span>
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-950 dark:text-white">{{ $row['label'] }}</p>
                    <p class="mt-0.5 truncate font-mono text-xs text-gray-500 dark:text-gray-400">{{ $row['code'] }}</p>
                </div>
            </div>
        </div>

        <div class="lg:text-right">
            <p class="text-2xl font-semibold text-gray-950 dark:text-white">{{ $row['count_label'] }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">eventos</p>
        </div>

        <div>
            <div class="h-2 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-950/5 dark:bg-white/10 dark:ring-white/10">
                <div class="h-full rounded-full {{ $barColor }}" style="width: {{ $progress }}%"></div>
            </div>
            <div class="mt-2 flex flex-wrap items-center gap-2">
                <x-filament::badge :color="$row['status_color']">{{ $row['status_label'] }}</x-filament::badge>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ number_format($progress, 1, ',', '.') }}% do maior volume</span>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
                <p class="text-xs text-gray-500 dark:text-gray-400">Conversão</p>
                <x-filament::badge class="mt-1" :color="$row['conversion_color']">{{ $row['conversion_label'] }}</x-filament::badge>
            </div>
            <div class="rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
                <p class="text-xs text-gray-500 dark:text-gray-400">Queda</p>
                <x-filament::badge class="mt-1" :color="$row['dropoff_color']">{{ $row['dropoff_label'] }}</x-filament::badge>
            </div>
        </div>
    </div>
</div>
