@props(['title' => '', 'items' => []])

<div class="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
    <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ $title }}</p>
    <ul class="mt-2 grid gap-2">
        @forelse ($items as $label => $value)
            <li class="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm ring-1 ring-gray-950/5 dark:bg-gray-900 dark:ring-white/10">
                <span class="truncate text-gray-700 dark:text-gray-200">{{ $label }}</span>
                <span class="font-semibold text-gray-950 dark:text-white">{{ $value }}</span>
            </li>
        @empty
            <li class="rounded-md bg-white px-3 py-4 text-sm text-gray-500 ring-1 ring-gray-950/5 dark:bg-gray-900 dark:text-gray-400 dark:ring-white/10">Sem dados.</li>
        @endforelse
    </ul>
</div>
