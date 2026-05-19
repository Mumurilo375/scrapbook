@props([
    'title' => 'Sem dados',
    'description' => null,
    'icon' => null,
    'color' => 'gray',
])

@php
    $palette = match ($color) {
        'success' => 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
        'warning' => 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
        'danger' => 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20',
        'info' => 'bg-sky-50 text-sky-700 ring-sky-600/10 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
        'primary' => 'bg-primary-50 text-primary-700 ring-primary-600/10 dark:bg-primary-400/10 dark:text-primary-300 dark:ring-primary-400/20',
        default => 'bg-gray-50 text-gray-600 ring-gray-950/10 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10',
    };
@endphp

<div class="rounded-lg border border-dashed border-gray-300 bg-gray-50/80 p-6 text-center dark:border-white/10 dark:bg-white/5">
    @if ($icon)
        <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-lg ring-1 {{ $palette }}">
            <x-filament::icon :icon="$icon" class="h-5 w-5" />
        </div>
    @endif

    <p class="{{ $icon ? 'mt-4' : '' }} text-sm font-semibold text-gray-950 dark:text-white">
        {{ $title }}
    </p>

    @if (filled($description))
        <p class="mx-auto mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            {{ $description }}
        </p>
    @endif
</div>
