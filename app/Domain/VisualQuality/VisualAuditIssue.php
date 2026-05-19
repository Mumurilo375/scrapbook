<?php

namespace App\Domain\VisualQuality;

final readonly class VisualAuditIssue
{
    public function __construct(
        public string $severity,
        public string $scope,
        public string $model,
        public ?string $id,
        public string $title,
        public string $message,
        public string $hint,
    ) {}

    public static function make(
        string $severity,
        string $scope,
        string $model,
        int|string|null $id,
        string $title,
        string $message,
        string $hint = '',
    ): self {
        return new self(
            severity: $severity,
            scope: $scope,
            model: $model,
            id: $id === null ? null : (string) $id,
            title: $title,
            message: $message,
            hint: $hint,
        );
    }

    /**
     * @return array{severity: string, scope: string, model: string, id: string|null, title: string, message: string, hint: string}
     */
    public function toArray(): array
    {
        return [
            'severity' => $this->severity,
            'scope' => $this->scope,
            'model' => $this->model,
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'hint' => $this->hint,
        ];
    }
}
