@props(['row'])

<details class="group rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-950/10 transition open:ring-primary-500/30 dark:bg-gray-900 dark:ring-white/10">
    <summary class="grid cursor-pointer list-none gap-3 md:grid-cols-[9rem_minmax(14rem,1.2fr)_8rem_8rem_minmax(12rem,1fr)_2rem] md:items-center">
        <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Horário</p>
            <p class="font-mono text-xs text-gray-600 dark:text-gray-300">{{ $row['time'] }}</p>
        </div>

        <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-gray-950 dark:text-white">{{ $row['title'] }}</p>
            <p class="mt-0.5 truncate font-mono text-xs text-gray-500 dark:text-gray-400">{{ $row['code'] }}</p>
        </div>

        <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Tipo</p>
            <x-filament::badge :color="$row['type_color']">{{ $row['type_label'] }}</x-filament::badge>
        </div>

        <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Origem</p>
            <x-filament::badge :color="$row['origin_color']">{{ $row['origin_label'] }}</x-filament::badge>
        </div>

        <div class="min-w-0">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 md:hidden">Contexto</p>
            <div class="flex flex-wrap gap-1.5">
                @forelse ($row['context'] as $context)
                    <span class="max-w-full truncate rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
                        {{ $context }}
                    </span>
                @empty
                    <span class="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                        Sem contexto
                    </span>
                @endforelse
            </div>
        </div>

        <div class="flex justify-end text-gray-400 transition group-open:rotate-180 dark:text-gray-500">
            <x-filament::icon :icon="\Filament\Support\Icons\Heroicon::OutlinedChevronDown" class="h-5 w-5" />
        </div>
    </summary>

    <div class="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
        <p class="text-sm font-medium text-gray-950 dark:text-white">Detalhes sanitizados</p>
        <p class="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{{ $row['summary'] }}</p>

        <div class="mt-3 flex flex-wrap gap-1.5">
            @forelse ($row['items'] as $item)
                <span class="max-w-full rounded-md bg-gray-50 px-2 py-1 font-mono text-xs text-gray-600 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
                    <span class="text-gray-400 dark:text-gray-500">{{ $item['label'] }}:</span>
                    {{ $item['value'] }}
                </span>
            @empty
                <span class="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-500 ring-1 ring-gray-950/5 dark:bg-white/5 dark:text-gray-400 dark:ring-white/10">
                    Nenhum payload exibível
                </span>
            @endforelse
        </div>
    </div>
</details>
