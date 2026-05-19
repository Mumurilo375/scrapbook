@props([
    'title' => '',
    'value' => '',
    'description' => null,
    'meta' => null,
    'icon' => null,
    'color' => 'gray',
    'compact' => false,
    'delta' => null,
])

@php
    $palette = match ($color) {
        'success' => [
            'ring' => 'ring-emerald-600/15 dark:ring-emerald-400/20',
            'bar' => 'bg-emerald-500',
            'icon' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
            'meta' => 'text-emerald-700 dark:text-emerald-300',
        ],
        'warning' => [
            'ring' => 'ring-amber-600/15 dark:ring-amber-400/20',
            'bar' => 'bg-amber-500',
            'icon' => 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
            'meta' => 'text-amber-700 dark:text-amber-300',
        ],
        'danger' => [
            'ring' => 'ring-red-600/15 dark:ring-red-400/20',
            'bar' => 'bg-red-500',
            'icon' => 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20',
            'meta' => 'text-red-700 dark:text-red-300',
        ],
        'info' => [
            'ring' => 'ring-sky-600/15 dark:ring-sky-400/20',
            'bar' => 'bg-sky-500',
            'icon' => 'bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
            'meta' => 'text-sky-700 dark:text-sky-300',
        ],
        'primary' => [
            'ring' => 'ring-primary-600/15 dark:ring-primary-400/20',
            'bar' => 'bg-primary-500',
            'icon' => 'bg-primary-50 text-primary-700 ring-primary-600/10 dark:bg-primary-400/10 dark:text-primary-300 dark:ring-primary-400/20',
            'meta' => 'text-primary-700 dark:text-primary-300',
        ],
        default => [
            'ring' => 'ring-gray-950/10 dark:ring-white/10',
            'bar' => 'bg-gray-300 dark:bg-gray-600',
            'icon' => 'bg-gray-50 text-gray-600 ring-gray-950/10 dark:bg-white/10 dark:text-gray-300 dark:ring-white/10',
            'meta' => 'text-gray-500 dark:text-gray-400',
        ],
    };
@endphp

<div class="relative overflow-hidden rounded-lg bg-white {{ $compact ? 'p-4' : 'p-5' }} shadow-sm ring-1 {{ $palette['ring'] }} dark:bg-gray-900">
    <div class="absolute inset-x-0 top-0 h-1 {{ $palette['bar'] }}"></div>

    <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $title }}</p>

                @if (filled($meta))
                    <span class="rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium {{ $palette['meta'] }} ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
                        {{ $meta }}
                    </span>
                @endif
            </div>

            <p class="{{ $compact ? 'mt-2 text-xl' : 'mt-3 text-3xl' }} font-semibold text-gray-950 dark:text-white">
                {{ $value }}
            </p>

            @if (filled($description))
                <p class="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">{{ $description }}</p>
            @endif

            @if (is_array($delta))
                <div class="mt-3 flex flex-wrap items-center gap-2">
                    <x-filament::badge :color="$delta['color'] ?? 'gray'">
                        {{ $delta['label'] ?? '0' }}
                    </x-filament::badge>
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {{ $delta['meta'] ?? 'vs comparação' }}
                    </span>
                </div>
            @endif
        </div>

        @if ($icon)
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 {{ $palette['icon'] }}">
                <x-filament::icon :icon="$icon" class="h-5 w-5" />
            </div>
        @endif
    </div>
</div>
