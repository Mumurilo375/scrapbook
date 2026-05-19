@props(['title' => '', 'value' => '', 'compact' => false])

<div class="rounded-xl border border-gray-200 bg-white {{ $compact ? 'p-4' : 'p-5 shadow-sm' }} dark:border-white/10 dark:bg-gray-900">
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ $title }}</p>
    <p class="{{ $compact ? 'mt-2 text-xl' : 'mt-3 text-2xl' }} font-semibold text-gray-950 dark:text-white">
        {{ $value }}
    </p>
</div>
