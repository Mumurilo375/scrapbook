<?php

use App\Domain\Analytics\Services\AnalyticsDailyAggregator;
use App\Domain\Analytics\Services\AnalyticsPruner;
use App\Domain\VisualQuality\VisualQualityAuditor;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('scrapbook:visual-audit', function (VisualQualityAuditor $auditor): int {
    $report = $auditor->audit();
    $counts = $report->counts();

    $this->info('Auditoria visual automática do Scrapbook');
    $this->line("Errors: {$counts['error']} | Warnings: {$counts['warning']} | Infos: {$counts['info']}");

    if ($counts['total'] === 0) {
        $this->info('Nenhum problema estrutural encontrado.');

        return 0;
    }

    foreach ($report->groupedByArea() as $area => $issues) {
        if ($issues === []) {
            continue;
        }

        $this->newLine();
        $this->line($area);

        foreach ($issues as $issue) {
            $id = $issue['id'] !== null ? " #{$issue['id']}" : '';
            $this->line("[{$issue['severity']}] {$issue['model']}{$id}: {$issue['title']}");
            $this->line("  {$issue['message']}");

            if ($issue['hint'] !== '') {
                $this->line("  Dica: {$issue['hint']}");
            }
        }
    }

    return 0;
})->purpose('Auditar assets, temas, templates e canvas sem alterar dados');

Artisan::command('scrapbook:analytics-aggregate {--date=} {--from=} {--to=} {--force}', function (AnalyticsDailyAggregator $aggregator): int {
    $date = $this->option('date');
    $from = $this->option('from');
    $to = $this->option('to');
    $force = (bool) $this->option('force');

    try {
        if (is_string($date) && $date !== '') {
            $result = $aggregator->aggregateDate($date, $force);
        } elseif ((is_string($from) && $from !== '') || (is_string($to) && $to !== '')) {
            if (! is_string($from) || $from === '' || ! is_string($to) || $to === '') {
                $this->error('Use --from e --to juntos no formato YYYY-MM-DD.');

                return 1;
            }

            $result = $aggregator->aggregateRange($from, $to, $force);
        } else {
            $result = $aggregator->aggregateDate(CarbonImmutable::yesterday(), $force);
        }
    } catch (Throwable $exception) {
        $this->error("Falha ao agregar analytics: {$exception->getMessage()}");

        return 1;
    }

    $range = isset($result['from'])
        ? "{$result['from']} até {$result['to']}"
        : $result['date'];

    $this->info("Analytics agregados para {$range}.");
    $this->line("Métricas gravadas/atualizadas: {$result['metrics_written']}");

    if ($result['errors'] !== []) {
        $this->warn('Alguns grupos falharam:');

        foreach ($result['errors'] as $error) {
            $this->line("- {$error['date']} [{$error['group']}]: {$error['message']}");
        }

        return 1;
    }

    return 0;
})->purpose('Agrega métricas diárias de analytics em analytics_daily_metrics');

Artisan::command('scrapbook:analytics-prune {--dry-run} {--force}', function (AnalyticsPruner $pruner): int {
    $dryRun = (bool) $this->option('dry-run');
    $force = (bool) $this->option('force');
    $estimate = $pruner->estimate();

    $this->info('Retenção de analytics');
    $this->line('Cortes:');

    foreach ($estimate['cutoffs'] as $table => $cutoff) {
        $this->line("- {$table}: antes de {$cutoff}");
    }

    $this->newLine();
    $this->line('Registros elegíveis:');

    foreach ($estimate['tables'] as $table => $count) {
        $this->line("- {$table}: {$count}");
    }

    $this->line('Total elegível: '.$estimate['total']);

    if ($estimate['keep_financial_events_forever']) {
        $this->line('Eventos financeiros antigos serão preservados.');
    }

    if ($dryRun) {
        $this->info('Dry-run: nenhum dado foi removido.');

        return 0;
    }

    if (! $force && ! $this->confirm('Remover os registros elegíveis de analytics?', false)) {
        $this->info('Prune cancelado.');

        return 0;
    }

    $result = $pruner->prune(false);

    $this->info('Prune concluído.');

    foreach ($result['deleted'] as $table => $count) {
        $this->line("- {$table}: {$count} removidos");
    }

    $this->line('Total removido: '.$result['deleted_total']);

    return 0;
})->purpose('Remove dados analíticos antigos respeitando retenção e preservação financeira');

if (app()->environment(['local', 'testing'])) {
    Schedule::useCache('array');
}

Schedule::command('scrapbook:analytics-aggregate')
    ->dailyAt('02:15');

Schedule::command('scrapbook:analytics-prune --force')
    ->dailyAt('03:15');
