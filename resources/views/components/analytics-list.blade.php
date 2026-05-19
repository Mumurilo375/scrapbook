@props(['title' => '', 'items' => []])

<div>
    <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ $title }}</p>
    <ul class="mt-2 grid gap-2">
        @forelse ($items as $label => $value)
            <li class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5">
                <span class="truncate text-gray-700 dark:text-gray-200">{{ $label }}</span>
                <span class="font-semibold text-gray-950 dark:text-white">{{ $value }}</span>
            </li>
        @empty
            <li class="text-sm text-gray-500 dark:text-gray-400">Sem dados.</li>
        @endforelse
    </ul>
</div>
