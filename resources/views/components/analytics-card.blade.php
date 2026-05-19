@props([
    'title' => '',
    'value' => '',
    'description' => null,
    'icon' => null,
    'color' => 'gray',
    'compact' => false,
])

@php
    $palette = match ($color) {
        'success' => [
            'ring' => 'ring-emerald-600/10 dark:ring-emerald-400/20',
            'iconBg' => 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
            'accent' => 'text-emerald-700 dark:text-emerald-300',
        ],
        'warning' => [
            'ring' => 'ring-amber-600/10 dark:ring-amber-400/20',
            'iconBg' => 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
            'accent' => 'text-amber-700 dark:text-amber-300',
        ],
        'danger' => [
            'ring' => 'ring-red-600/10 dark:ring-red-400/20',
            'iconBg' => 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300',
            'accent' => 'text-red-700 dark:text-red-300',
        ],
        'info' => [
            'ring' => 'ring-sky-600/10 dark:ring-sky-400/20',
            'iconBg' => 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300',
            'accent' => 'text-sky-700 dark:text-sky-300',
        ],
        'primary' => [
            'ring' => 'ring-primary-600/10 dark:ring-primary-400/20',
            'iconBg' => 'bg-primary-50 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300',
            'accent' => 'text-primary-700 dark:text-primary-300',
        ],
        default => [
            'ring' => 'ring-gray-950/5 dark:ring-white/10',
            'iconBg' => 'bg-gray-50 text-gray-600 dark:bg-white/10 dark:text-gray-300',
            'accent' => 'text-gray-600 dark:text-gray-300',
        ],
    };
@endphp

<div class="rounded-lg bg-white {{ $compact ? 'p-4' : 'p-5' }} shadow-sm ring-1 {{ $palette['ring'] }} dark:bg-gray-900">
    <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ $title }}</p>
            <p class="{{ $compact ? 'mt-2 text-xl' : 'mt-3 text-2xl' }} font-semibold text-gray-950 dark:text-white">
                {{ $value }}
            </p>

            @if (filled($description))
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $description }}</p>
            @endif
        </div>

        @if ($icon)
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg {{ $palette['iconBg'] }}">
                <x-filament::icon :icon="$icon" class="h-5 w-5" />
            </div>
        @endif
    </div>
</div>
