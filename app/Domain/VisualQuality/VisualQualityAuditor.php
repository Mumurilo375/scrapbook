<?php

namespace App\Domain\VisualQuality;

final class VisualQualityAuditor
{
    public function __construct(
        private readonly AssetQualityChecker $assetQualityChecker,
        private readonly ThemeQualityChecker $themeQualityChecker,
        private readonly TemplateQualityChecker $templateQualityChecker,
    ) {}

    public function audit(): VisualAuditReport
    {
        $issues = [
            ...$this->assetQualityChecker->check(),
            ...$this->themeQualityChecker->check(),
            ...$this->templateQualityChecker->check(),
        ];

        usort($issues, function (VisualAuditIssue $left, VisualAuditIssue $right): int {
            return [
                $this->severityWeight($left->severity),
                $left->scope,
                $left->model,
                $left->title,
                $left->id ?? '',
            ] <=> [
                $this->severityWeight($right->severity),
                $right->scope,
                $right->model,
                $right->title,
                $right->id ?? '',
            ];
        });

        return new VisualAuditReport($issues);
    }

    private function severityWeight(string $severity): int
    {
        return match ($severity) {
            'error' => 0,
            'warning' => 1,
            'info' => 2,
            default => 3,
        };
    }
}
