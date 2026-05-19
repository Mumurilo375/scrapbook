@props([
    'title' => '',
    'description' => null,
    'items' => [],
    'emptyTitle' => 'Sem dados.',
    'emptyDescription' => null,
])

<div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
    <div>
        <p class="text-sm font-semibold text-gray-950 dark:text-white">{{ $title }}</p>

        @if (filled($description))
            <p class="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{{ $description }}</p>
        @endif
    </div>

    <div class="mt-4 grid gap-2">
        @forelse ($items as $item)
            <div class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{{ $item['label'] }}</p>

                    @if (filled($item['meta'] ?? null))
                        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ $item['meta'] }}</p>
                    @endif
                </div>

                <x-filament::badge :color="$item['color'] ?? 'gray'">
                    {{ $item['value'] ?? $item['count'] ?? 'N/D' }}
                </x-filament::badge>
            </div>
        @empty
            <x-analytics.empty-state
                :title="$emptyTitle"
                :description="$emptyDescription"
                color="gray"
            />
        @endforelse
    </div>
</div>
