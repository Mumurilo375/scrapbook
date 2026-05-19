<?php

use App\Domain\VisualQuality\VisualQualityAuditor;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

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
