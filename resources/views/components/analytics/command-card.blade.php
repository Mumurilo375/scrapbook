@props([
    'title' => '',
    'command' => '',
    'description' => null,
])

<div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
    <div class="flex items-start justify-between gap-3">
        <div>
            <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ $title }}</p>

            @if (filled($description))
                <p class="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{{ $description }}</p>
            @endif
        </div>
    </div>

    <code class="mt-3 block overflow-x-auto rounded-lg bg-gray-950 px-3 py-2.5 text-xs text-gray-100 ring-1 ring-white/10 dark:bg-black">
        {{ $command }}
    </code>
</div>
