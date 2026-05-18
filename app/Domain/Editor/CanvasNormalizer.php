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

    private const DEFAULT_ELEMENT_WIDTH = 120;

    private const DEFAULT_ELEMENT_HEIGHT = 80;

    private const LAYER_STEP = 10;

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

        if (is_array($canvas['elements'])) {
            $canvas['elements'] = $this->normalizeElements($canvas['elements']);
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
     * @return array<string, mixed>
     */
    public function normalizeForPersistence(array $canvas): array
    {
        $canvas = $this->normalize($canvas);

        if (is_array($canvas['elements'] ?? null)) {
            $canvas['elements'] = $this->normalizeLayerOrder($canvas['elements']);
        }

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

    /**
     * @param  array<int, mixed>  $elements
     * @return array<int, mixed>
     */
    private function normalizeElements(array $elements): array
    {
        foreach ($elements as $index => $element) {
            if (! is_array($element)) {
                continue;
            }

            if (! array_key_exists('id', $element)) {
                $element['id'] = 'element_'.($index + 1);
            }

            if (! array_key_exists('x', $element)) {
                $element['x'] = 0;
            }

            if (! array_key_exists('y', $element)) {
                $element['y'] = 0;
            }

            if (! array_key_exists('w', $element)) {
                $element['w'] = $element['width'] ?? self::DEFAULT_ELEMENT_WIDTH;
            }

            if (! array_key_exists('h', $element)) {
                $element['h'] = $element['height'] ?? self::DEFAULT_ELEMENT_HEIGHT;
            }

            if (! array_key_exists('rotation', $element)) {
                $element['rotation'] = 0;
            }

            if (! array_key_exists('z', $element)) {
                $element['z'] = $element['zIndex'] ?? (($index + 1) * self::LAYER_STEP);
            }

            $elements[$index] = $element;
        }

        return $elements;
    }

    /**
     * @param  array<int, mixed>  $elements
     * @return array<int, mixed>
     */
    private function normalizeLayerOrder(array $elements): array
    {
        $sortable = [];

        foreach ($elements as $index => $element) {
            if (! is_array($element)) {
                continue;
            }

            $sortable[] = [
                'index' => $index,
                'z' => is_numeric($element['z'] ?? null) ? (float) $element['z'] : $index,
            ];
        }

        usort($sortable, fn (array $left, array $right): int => [$left['z'], $left['index']] <=> [$right['z'], $right['index']]);

        foreach ($sortable as $position => $item) {
            $index = $item['index'];

            if (! is_array($elements[$index] ?? null)) {
                continue;
            }

            $elements[$index]['z'] = ($position + 1) * self::LAYER_STEP;
            $elements[$index]['rotation'] = $this->normalizeRotation($elements[$index]['rotation'] ?? 0);
            unset($elements[$index]['width'], $elements[$index]['height'], $elements[$index]['zIndex']);
        }

        return $elements;
    }

    private function normalizeRotation(mixed $value): int|float
    {
        if (! is_numeric($value)) {
            return 0;
        }

        $rotation = fmod((float) $value, 360.0);

        if ($rotation > 180.0) {
            $rotation -= 360.0;
        }

        if ($rotation <= -180.0) {
            $rotation += 360.0;
        }

        return round($rotation, 2);
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
