<x-filament-panels::page>
    @php($dashboard = $this->dashboard())
    @php($overview = $dashboard['overview'])
    @php($revenue = $dashboard['revenue'])
    @php($viewer = $dashboard['viewer'])

    <div class="grid gap-6">
        <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div class="grid gap-2">
                <p class="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Produto
                </p>
                <h2 class="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                    Métricas internas seguras
                </h2>
                <p class="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Painel operacional para acompanhar funil, receita, viewer, eventos recentes e erros sem expor IP,
                    user-agent bruto, texto de presentes ou paths internos.
                </p>
            </div>
        </section>

        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <x-analytics-card title="Receita total" :value="$this->money($overview['revenue_total_cents'])" />
            <x-analytics-card title="Receita 7 dias" :value="$this->money($overview['revenue_7d_cents'])" />
            <x-analytics-card title="Gifts criados" :value="$overview['gifts_created']" />
            <x-analytics-card title="Gifts publicados" :value="$overview['gifts_published']" />
            <x-analytics-card title="Visitas públicas" :value="$overview['public_visits']" />
            <x-analytics-card title="Visitantes estimados" :value="$overview['unique_visitors']" />
            <x-analytics-card title="Checkout → pago" :value="$overview['checkout_to_paid_rate'].'%'" />
            <x-analytics-card title="Ticket médio" :value="$this->money($revenue['average_ticket_cents'])" />
        </section>

        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Funil principal</h3>
                <div class="mt-4 overflow-x-auto">
                    <table class="w-full min-w-[520px] text-left text-sm">
                        <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
                            <tr>
                                <th class="py-2 pr-3">Etapa</th>
                                <th class="py-2 pr-3">Contagem</th>
                                <th class="py-2 pr-3">Conversão</th>
                                <th class="py-2">Queda</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 dark:divide-white/10">
                            @foreach ($dashboard['funnel'] as $step)
                                <tr>
                                    <td class="py-2 pr-3 font-medium text-gray-950 dark:text-white">{{ $step['event'] }}</td>
                                    <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $step['count'] }}</td>
                                    <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $step['conversion_from_previous'] === null ? 'N/D' : $step['conversion_from_previous'].'%' }}</td>
                                    <td class="py-2 text-gray-700 dark:text-gray-200">{{ $step['dropoff_from_previous'] === null ? 'N/D' : $step['dropoff_from_previous'].'%' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Receita</h3>
                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                    <x-analytics-card title="Total aprovado" :value="$this->money($revenue['total_cents'])" compact />
                    <x-analytics-card title="Taxa aprovação" :value="$revenue['approval_rate'].'%'" compact />
                    <x-analytics-card title="Ticket médio" :value="$this->money($revenue['average_ticket_cents'])" compact />
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-2">
                    <x-analytics-list title="Pedidos por status" :items="$revenue['orders_by_status']" />
                    <x-analytics-list title="Pagamentos por status" :items="$revenue['payments_by_status']" />
                </div>
            </section>
        </div>

        <div class="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Viewer e gifts</h3>
                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                    <x-analytics-card title="Conclusão" :value="$viewer['completion_rate'].'%'" compact />
                    <x-analytics-card title="Média páginas" :value="$viewer['average_pages_viewed']" compact />
                    <x-analytics-card title="Polaroids" :value="$viewer['polaroid_interactions']" compact />
                </div>
                <div class="mt-5 grid gap-4 md:grid-cols-2">
                    <x-analytics-list title="Fontes" :items="$viewer['traffic_sources']" />
                    <x-analytics-list title="Templates mais usados" :items="collect($overview['top_templates'])->mapWithKeys(fn ($item) => [$item['name'] => $item['gifts_count']])->all()" />
                </div>
            </section>

            <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Receita por dimensão</h3>
                <div class="mt-4 grid gap-4">
                    @foreach (['revenue_by_plan' => 'Planos', 'revenue_by_template' => 'Templates', 'revenue_by_occasion' => 'Ocasiões', 'revenue_by_theme' => 'Temas'] as $key => $label)
                        <div>
                            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ $label }}</p>
                            <ul class="mt-2 grid gap-2">
                                @forelse ($revenue[$key] as $row)
                                    <li class="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-white/5">
                                        <span class="truncate text-gray-700 dark:text-gray-200">{{ $row['name'] }}</span>
                                        <span class="font-semibold text-gray-950 dark:text-white">{{ $this->money($row['revenue_cents']) }}</span>
                                    </li>
                                @empty
                                    <li class="text-sm text-gray-500 dark:text-gray-400">Sem dados.</li>
                                @endforelse
                            </ul>
                        </div>
                    @endforeach
                </div>
            </section>
        </div>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Eventos recentes</h3>
            <div class="mt-4 overflow-x-auto">
                <table class="w-full min-w-[760px] text-left text-sm">
                    <thead class="text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                            <th class="py-2 pr-3">Hora</th>
                            <th class="py-2 pr-3">Evento</th>
                            <th class="py-2 pr-3">Grupo</th>
                            <th class="py-2 pr-3">Usuário</th>
                            <th class="py-2 pr-3">Gift</th>
                            <th class="py-2 pr-3">Origem</th>
                            <th class="py-2">Payload</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-white/10">
                        @forelse ($dashboard['recent_events'] as $event)
                            <tr>
                                <td class="py-2 pr-3 text-gray-600 dark:text-gray-300">{{ $event['time'] }}</td>
                                <td class="py-2 pr-3 font-medium text-gray-950 dark:text-white">{{ $event['event_name'] }}</td>
                                <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $event['event_group'] }}</td>
                                <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $event['user'] ?? 'N/D' }}</td>
                                <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $event['gift'] ?? 'N/D' }}</td>
                                <td class="py-2 pr-3 text-gray-700 dark:text-gray-200">{{ $event['source'] }}</td>
                                <td class="py-2 text-gray-500 dark:text-gray-400">
                                    <code>{{ json_encode($event['payload'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) }}</code>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td class="py-4 text-sm text-gray-500 dark:text-gray-400" colspan="7">Nenhum evento registrado.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Logs e erros operacionais</h3>
            <ul class="mt-4 grid gap-3">
                @forelse ($dashboard['error_events'] as $event)
                    <li class="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm dark:border-red-400/20 dark:bg-red-400/10">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span class="font-semibold text-red-900 dark:text-red-100">{{ $event['event_name'] }}</span>
                            <span class="text-xs text-red-700 dark:text-red-200">{{ $event['time'] }}</span>
                        </div>
                        <p class="mt-1 text-red-800 dark:text-red-100">Origem: {{ $event['source'] }}</p>
                    </li>
                @empty
                    <li class="text-sm text-gray-500 dark:text-gray-400">Nenhum erro operacional registrado.</li>
                @endforelse
            </ul>
        </section>
    </div>
</x-filament-panels::page>
