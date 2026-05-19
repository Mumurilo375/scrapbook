@php
    use Filament\Support\Icons\Heroicon;
@endphp

<x-filament-panels::page>
    @php($view = $this->viewModel())
    @php($dashboard = $view['dashboard'])
    @php($health = $dashboard['health'])

    <div class="mx-auto grid w-full max-w-[92rem] gap-6">
        <x-filament::section>
            <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                        <x-filament::badge color="primary">Admin-only</x-filament::badge>
                        <x-filament::badge :color="$this->statusColor($health['status'])">
                            {{ $health['status_label'] }}
                        </x-filament::badge>

                        @if ($dashboard['comparison']['enabled'])
                            <x-filament::badge color="info">
                                Comparando {{ $dashboard['comparison']['period']['from'] }} até {{ $dashboard['comparison']['period']['to'] }}
                            </x-filament::badge>
                        @endif
                    </div>

                    <h2 class="mt-4 text-2xl font-semibold text-gray-950 dark:text-white sm:text-3xl">
                        Analytics e Observabilidade
                    </h2>
                    <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Lucro, vendas, preferências de clientes e atividade operacional em uma visão única.
                    </p>
                </div>

                <div class="flex flex-wrap gap-2 xl:justify-end">
                    <x-filament::button wire:click="$refresh" color="gray" outlined :icon="Heroicon::OutlinedArrowPath">
                        Atualizar
                    </x-filament::button>
                    <x-filament::button wire:click="toggleComparison" :color="$this->compareEnabled ? 'info' : 'gray'" outlined :icon="Heroicon::OutlinedCalendarDays">
                        Comparar
                    </x-filament::button>
                </div>
            </div>

            <div class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                <div class="grid gap-3">
                    <div class="flex flex-wrap gap-2">
                        @foreach ($this->periodOptions() as $value => $label)
                            <button
                                type="button"
                                wire:click="setPeriod('{{ $value }}')"
                                @class([
                                    'rounded-lg px-3 py-2 text-sm font-medium transition ring-1',
                                    'bg-primary-600 text-white shadow-sm ring-primary-600' => $this->period === $value,
                                    'bg-white text-gray-700 ring-gray-950/10 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/10' => $this->period !== $value,
                                ])
                            >
                                {{ $label }}
                            </button>
                        @endforeach
                    </div>

                    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span class="font-medium text-gray-700 dark:text-gray-200">
                            {{ $dashboard['period']['label'] }}
                        </span>
                        <span>{{ $dashboard['period']['from'] }} até {{ $dashboard['period']['to'] }}</span>
                    </div>
                </div>

                @if ($this->period === 'custom')
                    <div class="grid gap-2 sm:grid-cols-2">
                        <label class="grid gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            Início
                            <input type="date" wire:model.live="from" class="rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-primary-500 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-white" />
                        </label>
                        <label class="grid gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            Fim
                            <input type="date" wire:model.live="to" class="rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-primary-500 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-white" />
                        </label>
                    </div>
                @endif
            </div>

            @if ($this->compareEnabled)
                <div class="mt-4 grid gap-3 rounded-lg bg-sky-50 p-4 ring-1 ring-sky-600/10 dark:bg-sky-400/10 dark:ring-sky-400/20 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div class="grid gap-2 sm:grid-cols-2">
                        <label class="grid gap-1 text-xs font-medium text-sky-900 dark:text-sky-100">
                            Comparar início
                            <input type="date" wire:model.live="compareFrom" class="rounded-lg border-sky-200 text-sm shadow-sm transition focus:border-sky-500 focus:ring-sky-500 dark:border-sky-400/20 dark:bg-gray-900 dark:text-white" />
                        </label>
                        <label class="grid gap-1 text-xs font-medium text-sky-900 dark:text-sky-100">
                            Comparar fim
                            <input type="date" wire:model.live="compareTo" class="rounded-lg border-sky-200 text-sm shadow-sm transition focus:border-sky-500 focus:ring-sky-500 dark:border-sky-400/20 dark:bg-gray-900 dark:text-white" />
                        </label>
                    </div>

                    <x-filament::button wire:click="clearComparison" color="gray" outlined>
                        Limpar comparação
                    </x-filament::button>
                </div>
            @endif
        </x-filament::section>

        <div class="rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
            <div class="overflow-x-auto">
                <x-filament::tabs contained label="Seções do analytics" class="min-w-max">
                    @foreach ($view['tabs'] as $key => $tab)
                        <x-filament::tabs.item
                            wire:click="setActiveTab('{{ $key }}')"
                            :active="$this->activeTab === $key"
                            :icon="$tab['icon']"
                            :badge="$tab['badge']"
                            :badge-color="$tab['badge_color']"
                        >
                            {{ $tab['label'] }}
                        </x-filament::tabs.item>
                    @endforeach
                </x-filament::tabs>
            </div>
        </div>

        @if ($this->activeTab === 'dashboard')
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @foreach ($view['kpiCards'] as $card)
                    <x-analytics.metric-card
                        compact
                        :title="$card['title']"
                        :value="$card['value']"
                        :description="$card['description']"
                        :icon="$card['icon']"
                        :color="$card['color']"
                        :delta="$card['delta']"
                    />
                @endforeach
            </div>

            <div class="grid gap-6 xl:grid-cols-3">
                @foreach ($view['trendCards'] as $card)
                    <x-analytics.trend-card
                        :title="$card['title']"
                        :description="$card['description']"
                        :value="$card['value']"
                        :series="$card['series']"
                        :comparison="$card['comparison']"
                        :color="$card['color']"
                    />
                @endforeach
            </div>

            <div class="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
                <x-filament::section
                    heading="Funil resumido"
                    :description="$view['funnelSummary']['insight']"
                    :icon="Heroicon::OutlinedChartBar"
                    icon-color="primary"
                >
                    <div class="grid gap-3">
                        @foreach ($view['funnelSummary']['rows'] as $row)
                            <div class="rounded-lg bg-white p-4 ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="min-w-0">
                                        <p class="truncate text-sm font-semibold text-gray-950 dark:text-white">{{ $row['label'] }}</p>
                                        <p class="mt-0.5 truncate font-mono text-xs text-gray-500 dark:text-gray-400">{{ $row['code'] }}</p>
                                    </div>
                                    <p class="shrink-0 text-xl font-semibold text-gray-950 dark:text-white">{{ $row['count_label'] }}</p>
                                </div>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <x-filament::badge :color="$row['conversion_color']">Conv. {{ $row['conversion_label'] }}</x-filament::badge>
                                    <x-filament::badge color="gray">Queda {{ $row['dropoff_label'] }}</x-filament::badge>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </x-filament::section>

                <div class="grid gap-6 md:grid-cols-2">
                    @foreach ($view['preferenceSections'] as $section)
                        <x-analytics.preference-card
                            :title="$section['title']"
                            :description="$section['description']"
                            :items="$section['items']"
                            :color="$section['color']"
                        />
                    @endforeach
                </div>
            </div>
        @endif

        @if ($this->activeTab === 'operational')
            <x-filament::section
                heading="Eventos, ações e logs"
                description="Feed operacional com eventos de produto e activity_log."
                :icon="Heroicon::OutlinedClipboardDocumentList"
                icon-color="gray"
            >
                <div class="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_12rem_12rem]">
                    <label class="grid gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        Busca
                        <input
                            type="search"
                            wire:model.live.debounce.400ms="operationalSearch"
                            placeholder="Evento, ação ou origem"
                            class="rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-primary-500 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                        />
                    </label>

                    <label class="grid gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        Tipo
                        <select wire:model.live="operationalType" class="rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-primary-500 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-white">
                            @foreach ($view['operationalTypeOptions'] as $value => $label)
                                <option value="{{ $value }}">{{ $label }}</option>
                            @endforeach
                        </select>
                    </label>

                    <label class="grid gap-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                        Origem
                        <select wire:model.live="operationalSource" class="rounded-lg border-gray-300 text-sm shadow-sm transition focus:border-primary-500 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-white">
                            @foreach ($view['operationalSourceOptions'] as $value => $label)
                                <option value="{{ $value }}">{{ $label }}</option>
                            @endforeach
                        </select>
                    </label>
                </div>

                <div class="mt-5 grid gap-3">
                    @forelse ($view['operationalFeed'] as $row)
                        <x-analytics.operational-row :row="$row" />
                    @empty
                        <x-analytics.empty-state
                            title="Nenhum evento operacional encontrado."
                            description="Ajuste os filtros ou selecione outro período para ampliar a busca."
                            :icon="Heroicon::OutlinedClipboardDocumentList"
                        />
                    @endforelse
                </div>

                @if ($view['operationalFeed']->hasPages())
                    <div class="mt-5">
                        {{ $view['operationalFeed']->links() }}
                    </div>
                @endif
            </x-filament::section>

            <x-filament::section
                heading="Resumo de saúde"
                description="Estado operacional do analytics, agregação diária e retenção."
                :icon="Heroicon::OutlinedBolt"
                icon-color="success"
            >
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    @foreach ($view['healthCards'] as $card)
                        <x-analytics.metric-card
                            compact
                            :title="$card['title']"
                            :value="$card['value']"
                            :description="$card['description']"
                            :icon="$card['icon']"
                            :color="$card['color']"
                        />
                    @endforeach
                </div>

                <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    @foreach ($view['healthItems'] as $item)
                        <div class="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-950/10 dark:bg-gray-900 dark:ring-white/10">
                            <div class="flex items-center justify-between gap-3">
                                <p class="truncate font-mono text-xs text-gray-500 dark:text-gray-400">{{ $item['label'] }}</p>
                                <x-filament::badge :color="$item['color']">{{ $item['value'] }}</x-filament::badge>
                            </div>
                        </div>
                    @endforeach
                </div>
            </x-filament::section>

            <div class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <x-filament::section
                    heading="Retenção e prune"
                    description="Estimativa de registros elegíveis por tabela."
                    :icon="Heroicon::OutlinedCommandLine"
                    icon-color="warning"
                >
                    <x-analytics.list-card
                        title="Registros elegíveis"
                        :items="$view['pruneRows']"
                        empty-title="Nenhum registro elegível."
                    />
                </x-filament::section>

                <x-filament::section
                    heading="Comandos úteis"
                    description="Referência operacional. A página não executa comandos destrutivos."
                    :icon="Heroicon::OutlinedCommandLine"
                    icon-color="warning"
                >
                    <div class="grid gap-4 lg:grid-cols-2">
                        @foreach ($view['commandCards'] as $command)
                            <x-analytics.command-card
                                :title="$command['title']"
                                :command="$command['command']"
                                :description="$command['description']"
                            />
                        @endforeach
                    </div>
                </x-filament::section>
            </div>
        @endif
    </div>
</x-filament-panels::page>
