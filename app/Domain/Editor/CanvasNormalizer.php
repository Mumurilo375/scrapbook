<?php

namespace App\Domain\Editor;

final class CanvasNormalizer
{
    public const DEFAULT_WIDTH = 1080;

    public const DEFAULT_HEIGHT = 1350;

    public const DEFAULT_SAFE_AREA = [
        'top' => 80,
        'right' => 80,
        'bottom' => 80,
        'left' => 80,
    ];

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    public function normalize(array $canvas): array
    {
        $schemaVersion = $canvas['schemaVersion'] ?? $canvas['version'] ?? 1;

        if ($schemaVersion === '1') {
            $schemaVersion = 1;
        }

        $version = $canvas['version'] ?? $schemaVersion;

        if ($version === '1') {
            $version = 1;
        }

        $canvas['schemaVersion'] = $schemaVersion;
        $canvas['version'] = $version;

        if (! array_key_exists('elements', $canvas)) {
            $canvas['elements'] = [];
        }

        $existingArtboard = $canvas['artboard'] ?? null;
        $artboard = is_array($existingArtboard) ? $existingArtboard : [];
        $hadArtboard = is_array($existingArtboard);

        if (! $hadArtboard || ! array_key_exists('width', $artboard)) {
            $artboard['width'] = self::DEFAULT_WIDTH;
        }

        if (! $hadArtboard || ! array_key_exists('height', $artboard)) {
            $artboard['height'] = self::DEFAULT_HEIGHT;
        }

        $artboard['unit'] = is_string($artboard['unit'] ?? null) && $artboard['unit'] !== ''
            ? $artboard['unit']
            : 'px';

        $artboard['background'] = is_array($artboard['background'] ?? null)
            ? $artboard['background']
            : ['type' => 'theme'];

        $artboard['safeArea'] = $this->normalizeSafeArea($artboard['safeArea'] ?? null);

        $canvas['artboard'] = $artboard;

        return $canvas;
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    public function hasValidArtboard(array $canvas): bool
    {
        $artboard = $canvas['artboard'] ?? null;

        if (! is_array($artboard)) {
            return false;
        }

        return $this->isPositiveNumber($artboard['width'] ?? null)
            && $this->isPositiveNumber($artboard['height'] ?? null);
    }

    /**
     * @return array{top: int|float, right: int|float, bottom: int|float, left: int|float}
     */
    private function normalizeSafeArea(mixed $safeArea): array
    {
        if (! is_array($safeArea)) {
            return self::DEFAULT_SAFE_AREA;
        }

        return [
            'top' => $this->nonNegativeNumber($safeArea['top'] ?? null, self::DEFAULT_SAFE_AREA['top']),
            'right' => $this->nonNegativeNumber($safeArea['right'] ?? null, self::DEFAULT_SAFE_AREA['right']),
            'bottom' => $this->nonNegativeNumber($safeArea['bottom'] ?? null, self::DEFAULT_SAFE_AREA['bottom']),
            'left' => $this->nonNegativeNumber($safeArea['left'] ?? null, self::DEFAULT_SAFE_AREA['left']),
        ];
    }

    private function nonNegativeNumber(mixed $value, int|float $fallback): int|float
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        $number = $value + 0;

        return $number >= 0 ? $number : $fallback;
    }

    private function isPositiveNumber(mixed $value): bool
    {
        return is_numeric($value) && (float) $value > 0;
    }
}
