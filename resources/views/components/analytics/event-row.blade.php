@props([
    'event',
    'compact' => false,
])

<div class="grid gap-3 px-4 py-4 text-sm md:grid-cols-[8.5rem_minmax(12rem,1.15fr)_7rem_minmax(12rem,1fr)_6rem_minmax(14rem,1.25fr)] md:items-start">
    <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Horário</p>
        <p class="mt-1 break-words font-mono text-xs text-gray-600 dark:text-gray-300 md:mt-0">{{ $event['time'] }}</p>
    </div>

    <div class="min-w-0">
        <p class="font-semibold text-gray-950 dark:text-white">{{ $event['event_label'] }}</p>
        <p class="mt-1 truncate font-mono text-xs text-gray-500 dark:text-gray-400">{{ $event['event_code'] }}</p>
    </div>

    <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Grupo</p>
        <x-filament::badge class="mt-1 md:mt-0" :color="$event['group_color']">{{ $event['group'] }}</x-filament::badge>
    </div>

    <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Contexto</p>
        <div class="mt-1 flex flex-wrap gap-1.5 md:mt-0">
            @forelse ($event['context'] as $context)
                <span class="max-w-full truncate rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10">
                    {{ $context }}
                </span>
            @empty
                <span class="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                    Sem contexto
                </span>
            @endforelse
        </div>
    </div>

    <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Source</p>
        <x-filament::badge class="mt-1 md:mt-0" :color="$event['source_color']">{{ $event['source'] }}</x-filament::badge>
    </div>

    <div>
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Payload</p>
        <div class="mt-1 flex flex-wrap gap-1.5 md:mt-0">
            @forelse ($event['payload_items'] as $item)
                <span class="max-w-full rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-600 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
                    <span class="text-gray-400 dark:text-gray-500">{{ $item['label'] }}:</span>
                    {{ $item['value'] }}
                </span>
            @empty
                <span class="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                    {{ $event['payload_summary'] }}
                </span>
            @endforelse
        </div>
    </div>
</div>
