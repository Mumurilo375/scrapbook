<x-filament-panels::page>
    @php($audit = $this->visualAudit())

    <div class="grid gap-6">
        <section class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div class="grid gap-3">
                <p class="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                    Checklist interno
                </p>
                <h2 class="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
                    QA visual/mobile com assets reais
                </h2>
                <p class="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Use esta pagina para validar o produto com assets finais antes de avancar para novas features.
                    O foco e editor, templates, viewer publico, Book Mode, envelope, polaroid, QR Code e performance
                    em celular.
                </p>
                <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                    Nao avance gateway, landing, mini game, marketplace, template builder ou novo componente interativo
                    durante esta passada.
                </div>
            </div>
        </section>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                        Auditoria automatica
                    </p>
                    <h3 class="mt-1 text-lg font-semibold text-gray-950 dark:text-white">
                        Checks estruturais antes do QA manual
                    </h3>
                    <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                        A auditoria e somente leitura e tambem pode ser rodada pelo terminal com
                        <code>php artisan scrapbook:visual-audit</code>.
                    </p>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-400/30 dark:bg-red-400/10">
                        <p class="text-2xl font-semibold text-red-700 dark:text-red-200">{{ $audit['counts']['error'] }}</p>
                        <p class="text-xs font-medium uppercase text-red-700 dark:text-red-200">errors</p>
                    </div>
                    <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/30 dark:bg-amber-400/10">
                        <p class="text-2xl font-semibold text-amber-700 dark:text-amber-200">{{ $audit['counts']['warning'] }}</p>
                        <p class="text-xs font-medium uppercase text-amber-700 dark:text-amber-200">warnings</p>
                    </div>
                    <div class="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-400/30 dark:bg-sky-400/10">
                        <p class="text-2xl font-semibold text-sky-700 dark:text-sky-200">{{ $audit['counts']['info'] }}</p>
                        <p class="text-xs font-medium uppercase text-sky-700 dark:text-sky-200">infos</p>
                    </div>
                </div>
            </div>

            @if ($audit['counts']['total'] === 0)
                <div class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                    Nenhum problema estrutural encontrado pela auditoria automatica.
                </div>
            @else
                <div class="mt-5 grid gap-4 lg:grid-cols-2">
                    @foreach ($audit['groups'] as $area => $issues)
                        <div class="rounded-lg border border-gray-200 p-4 dark:border-white/10">
                            <h4 class="font-semibold text-gray-950 dark:text-white">{{ $area }}</h4>

                            @if ($issues === [])
                                <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Sem achados nesta area.</p>
                            @else
                                <ul class="mt-3 grid gap-3">
                                    @foreach ($issues as $issue)
                                        @php($badgeClass = match ($issue['severity']) {
                                            'error' => 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-100',
                                            'warning' => 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-100',
                                            default => 'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-100',
                                        })

                                        <li class="grid gap-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                                            <div class="flex flex-wrap items-center gap-2">
                                                <span class="rounded px-2 py-0.5 text-xs font-semibold uppercase {{ $badgeClass }}">
                                                    {{ $issue['severity'] }}
                                                </span>
                                                <span class="font-semibold text-gray-950 dark:text-white">{{ $issue['title'] }}</span>
                                            </div>
                                            <p>{{ $issue['message'] }}</p>
                                            @if ($issue['hint'] !== '')
                                                <p class="text-gray-500 dark:text-gray-400">Dica: {{ $issue['hint'] }}</p>
                                            @endif
                                        </li>
                                    @endforeach
                                </ul>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
            @foreach ($this->checklistGroups() as $group)
                <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
                    <div class="grid gap-2">
                        <h3 class="text-lg font-semibold text-gray-950 dark:text-white">
                            {{ $group['title'] }}
                        </h3>
                        <p class="text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {{ $group['description'] }}
                        </p>
                    </div>

                    <ul class="mt-4 grid gap-3">
                        @foreach ($group['items'] as $item)
                            <li class="flex gap-3 text-sm leading-6 text-gray-700 dark:text-gray-200">
                                <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500"></span>
                                <span>{{ $item }}</span>
                            </li>
                        @endforeach
                    </ul>
                </section>
            @endforeach
        </div>

        <section class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h3 class="text-lg font-semibold text-gray-950 dark:text-white">Criterio de aprovacao</h3>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                A rodada passa quando o fluxo completo funciona com assets reais, nao ha overflow horizontal no editor
                mobile, o viewer publico navega bem no celular, envelope/polaroid nao conflitam com swipe, e o payload
                publico continua sem storage_path ou URLs arbitrarias.
            </p>
            <p class="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                O espelho markdown deste checklist fica em <code>docs/visual-qa-checklist.md</code>.
            </p>
        </section>
    </div>
</x-filament-panels::page>
