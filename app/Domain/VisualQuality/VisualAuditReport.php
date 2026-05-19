<?php

namespace App\Domain\VisualQuality;

final readonly class VisualAuditReport
{
    /**
     * @param  array<int, VisualAuditIssue>  $issues
     */
    public function __construct(private array $issues) {}

    /**
     * @return array<int, VisualAuditIssue>
     */
    public function issues(): array
    {
        return $this->issues;
    }

    /**
     * @return array<int, array{severity: string, scope: string, model: string, id: string|null, title: string, message: string, hint: string}>
     */
    public function issuesAsArrays(): array
    {
        return array_map(
            fn (VisualAuditIssue $issue): array => $issue->toArray(),
            $this->issues,
        );
    }

    /**
     * @return array{error: int, warning: int, info: int, total: int}
     */
    public function counts(): array
    {
        return [
            'error' => $this->countBySeverity('error'),
            'warning' => $this->countBySeverity('warning'),
            'info' => $this->countBySeverity('info'),
            'total' => count($this->issues),
        ];
    }

    /**
     * @return array<string, array<int, array{severity: string, scope: string, model: string, id: string|null, title: string, message: string, hint: string}>>
     */
    public function groupedByArea(): array
    {
        $groups = [
            'Assets' => [],
            'Temas' => [],
            'Templates' => [],
            'Canvas' => [],
        ];

        foreach ($this->issuesAsArrays() as $issue) {
            $groups[$this->areaForScope($issue['scope'])][] = $issue;
        }

        return $groups;
    }

    /**
     * @return array{counts: array{error: int, warning: int, info: int, total: int}, groups: array<string, array<int, array{severity: string, scope: string, model: string, id: string|null, title: string, message: string, hint: string}>>}
     */
    public function toArray(): array
    {
        return [
            'counts' => $this->counts(),
            'groups' => $this->groupedByArea(),
        ];
    }

    private function countBySeverity(string $severity): int
    {
        return count(array_filter(
            $this->issues,
            fn (VisualAuditIssue $issue): bool => $issue->severity === $severity,
        ));
    }

    private function areaForScope(string $scope): string
    {
        return match ($scope) {
            'asset', 'asset_category' => 'Assets',
            'theme' => 'Temas',
            'template' => 'Templates',
            'canvas' => 'Canvas',
            default => 'Canvas',
        };
    }
}
