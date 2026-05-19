<?php

namespace App\Domain\Editor;

use App\Domain\Gifts\Models\GiftPage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CanvasSecurity
{
    public const DEFAULT_TEXT_MAX_LENGTH = 1000;

    private const MAX_ARTBOARD_SIZE = 10000;

    private const MAX_ELEMENT_COORDINATE = 10000;

    private const MAX_ELEMENT_SIZE = 10000;

    private const MAX_ELEMENT_ROTATION = 3600;

    private const MAX_ELEMENT_Z = 100000;

    private const MAX_ELEMENT_NAME_LENGTH = 80;

    public function __construct(private readonly CanvasNormalizer $normalizer) {}

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    public function sanitizeAndValidate(array $canvas, int $textMaxLength = self::DEFAULT_TEXT_MAX_LENGTH): array
    {
        $canvas = $this->sanitizeStrings($canvas);
        $canvas = $this->normalizer->normalize($canvas);

        $this->validate($canvas, $textMaxLength);

        return $this->normalizer->normalizeForPersistence($canvas);
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    public function validate(array $canvas, int $textMaxLength = self::DEFAULT_TEXT_MAX_LENGTH): void
    {
        if (($canvas['schemaVersion'] ?? null) !== 1) {
            throw ValidationException::withMessages([
                'canvas.schemaVersion' => 'O canvas precisa declarar schemaVersion 1.',
            ]);
        }

        if (array_key_exists('version', $canvas) && ($canvas['version'] ?? null) !== 1) {
            throw ValidationException::withMessages([
                'canvas.version' => 'O canvas precisa declarar version 1.',
            ]);
        }

        if (! $this->normalizer->hasValidArtboard($canvas)) {
            throw ValidationException::withMessages([
                'canvas.artboard' => 'O canvas precisa ter artboard com width e height positivos.',
            ]);
        }

        if (! isset($canvas['elements']) || ! is_array($canvas['elements'])) {
            throw ValidationException::withMessages([
                'canvas.elements' => 'O canvas precisa ter uma lista de elementos.',
            ]);
        }

        $this->validateArtboard($canvas['artboard']);
        $this->validateElements($canvas['elements']);

        $this->inspectValue($canvas, max(1, $textMaxLength));
    }

    public function textMaxLengthForPage(GiftPage $giftPage): int
    {
        $settings = $giftPage->settings ?? [];
        $maxLength = data_get($settings, 'constraints.maxTextLength')
            ?? data_get($settings, 'constraints.max_text_length')
            ?? data_get($settings, 'maxTextLength')
            ?? data_get($settings, 'max_text_length');

        if (is_numeric($maxLength)) {
            return max(1, min(5000, (int) $maxLength));
        }

        return self::DEFAULT_TEXT_MAX_LENGTH;
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<string, mixed>
     */
    private function sanitizeStrings(array $value): array
    {
        foreach ($value as $key => $child) {
            if (is_array($child)) {
                $value[$key] = $this->sanitizeStrings($child);

                continue;
            }

            if (! is_string($child)) {
                continue;
            }

            $child = str_replace("\0", '', $child);

            if (in_array(strtolower((string) $key), ['text', 'content'], true)) {
                $child = str_replace(["\r\n", "\r"], "\n", $child);
            }

            $value[$key] = $child;
        }

        return $value;
    }

    private function inspectValue(mixed $value, int $textMaxLength, string $key = ''): void
    {
        if (is_array($value)) {
            foreach ($value as $childKey => $child) {
                $this->inspectValue($child, $textMaxLength, strtolower((string) $childKey));
            }

            return;
        }

        if (! is_string($value)) {
            return;
        }

        if (preg_match('/(?:https?:)?\/\/[^\s]+/i', $value) === 1) {
            throw ValidationException::withMessages([
                'canvas' => 'O canvas não pode referenciar URLs externas nesta etapa.',
            ]);
        }

        if (preg_match('/^\s*(?:javascript|data|vbscript):/i', $value) === 1) {
            throw ValidationException::withMessages([
                'canvas' => 'O canvas não pode conter protocolos inseguros.',
            ]);
        }

        if (in_array($key, ['html', 'innerhtml'], true)
            || preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $value) === 1
        ) {
            throw ValidationException::withMessages([
                'canvas' => 'O canvas não pode receber HTML arbitrário.',
            ]);
        }

        if (in_array($key, ['text', 'content'], true) && Str::length($value) > $textMaxLength) {
            throw ValidationException::withMessages([
                'canvas.text' => "Textos do canvas devem ter no máximo {$textMaxLength} caracteres.",
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $artboard
     */
    private function validateArtboard(array $artboard): void
    {
        foreach (['width', 'height'] as $field) {
            $number = $this->finiteNumber($artboard[$field] ?? null);

            if ($number === null || $number <= 0 || $number > self::MAX_ARTBOARD_SIZE) {
                throw ValidationException::withMessages([
                    "canvas.artboard.{$field}" => 'O artboard precisa usar dimensões positivas e seguras.',
                ]);
            }
        }

        if (array_key_exists('unit', $artboard) && $artboard['unit'] !== 'px') {
            throw ValidationException::withMessages([
                'canvas.artboard.unit' => 'O artboard precisa usar unidade px.',
            ]);
        }

        $safeArea = $artboard['safeArea'] ?? null;

        if (! is_array($safeArea)) {
            throw ValidationException::withMessages([
                'canvas.artboard.safeArea' => 'O artboard precisa ter safeArea válido.',
            ]);
        }

        foreach (['top', 'right', 'bottom', 'left'] as $side) {
            $number = $this->finiteNumber($safeArea[$side] ?? null);

            if ($number === null || $number < 0 || $number > self::MAX_ARTBOARD_SIZE) {
                throw ValidationException::withMessages([
                    "canvas.artboard.safeArea.{$side}" => 'O safeArea do artboard precisa usar valores não negativos.',
                ]);
            }
        }

        $this->validateArtboardBackground($artboard['background'] ?? null);
    }

    /**
     * @param  array<string, mixed>|mixed  $background
     */
    private function validateArtboardBackground(mixed $background): void
    {
        if (! is_array($background)) {
            throw ValidationException::withMessages([
                'canvas.artboard.background' => 'O fundo da página precisa ser um objeto válido.',
            ]);
        }

        $type = $background['type'] ?? null;

        if ($type === 'theme') {
            $this->validateAllowedKeys($background, ['type'], 'canvas.artboard.background');

            return;
        }

        if ($type !== 'asset') {
            throw ValidationException::withMessages([
                'canvas.artboard.background.type' => 'O fundo da página precisa usar type theme ou asset.',
            ]);
        }

        $this->validateAllowedKeys($background, ['type', 'assetId', 'asset_id', 'fit', 'opacity'], 'canvas.artboard.background');

        $assetId = $background['assetId'] ?? $background['asset_id'] ?? null;

        if (! is_string($assetId) && ! is_int($assetId)) {
            throw ValidationException::withMessages([
                'canvas.artboard.background.assetId' => 'O papel da página precisa usar um assetId válido.',
            ]);
        }

        $assetId = trim((string) $assetId);

        if ($assetId === '' || preg_match('/^[A-Za-z0-9_-]{1,80}$/', $assetId) !== 1) {
            throw ValidationException::withMessages([
                'canvas.artboard.background.assetId' => 'O papel da página precisa usar um assetId válido.',
            ]);
        }

        if (array_key_exists('fit', $background) && ! in_array($background['fit'], ['cover', 'contain'], true)) {
            throw ValidationException::withMessages([
                'canvas.artboard.background.fit' => 'O encaixe do papel precisa ser cover ou contain.',
            ]);
        }

        if (array_key_exists('opacity', $background)) {
            $opacity = $this->finiteNumber($background['opacity']);

            if ($opacity === null || $opacity < 0 || $opacity > 1) {
                throw ValidationException::withMessages([
                    'canvas.artboard.background.opacity' => 'A opacidade do papel precisa ficar entre 0 e 1.',
                ]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  array<int, string>  $allowedKeys
     */
    private function validateAllowedKeys(array $value, array $allowedKeys, string $path): void
    {
        foreach (array_keys($value) as $key) {
            if (! in_array((string) $key, $allowedKeys, true)) {
                throw ValidationException::withMessages([
                    $path => 'O fundo da página não pode salvar URLs, paths internos ou campos manuais.',
                ]);
            }
        }
    }

    /**
     * @param  array<int, mixed>  $elements
     */
    private function validateElements(array $elements): void
    {
        foreach ($elements as $index => $element) {
            if (! is_array($element)) {
                throw ValidationException::withMessages([
                    "canvas.elements.{$index}" => 'Cada elemento do canvas precisa ser um objeto válido.',
                ]);
            }

            if (! is_string($element['id'] ?? null) || trim((string) $element['id']) === '') {
                throw ValidationException::withMessages([
                    "canvas.elements.{$index}.id" => 'Todo elemento do canvas precisa ter id.',
                ]);
            }

            if (! is_string($element['type'] ?? null) || trim((string) $element['type']) === '') {
                throw ValidationException::withMessages([
                    "canvas.elements.{$index}.type" => 'Todo elemento do canvas precisa ter type.',
                ]);
            }

            $this->validateElementNumber($element, $index, 'x', -self::MAX_ELEMENT_COORDINATE, self::MAX_ELEMENT_COORDINATE);
            $this->validateElementNumber($element, $index, 'y', -self::MAX_ELEMENT_COORDINATE, self::MAX_ELEMENT_COORDINATE);
            $this->validateElementNumber($element, $index, 'w', 1, self::MAX_ELEMENT_SIZE);
            $this->validateElementNumber($element, $index, 'h', 1, self::MAX_ELEMENT_SIZE);
            $this->validateElementNumber($element, $index, 'rotation', -self::MAX_ELEMENT_ROTATION, self::MAX_ELEMENT_ROTATION);
            $this->validateElementNumber($element, $index, 'z', -self::MAX_ELEMENT_Z, self::MAX_ELEMENT_Z);
            $this->validateElementName($element, $index);
            $this->validateElementBoolean($element, $index, 'locked');
            $this->validateElementBoolean($element, $index, 'hidden');

            $this->validateElementStyle($element, $index);
        }
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function validateElementNumber(array $element, int $index, string $field, int|float $min, int|float $max): void
    {
        $number = $this->finiteNumber($element[$field] ?? null);

        if ($number === null || $number < $min || $number > $max) {
            throw ValidationException::withMessages([
                "canvas.elements.{$index}.{$field}" => 'Transformações do canvas precisam usar números finitos e seguros.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function validateElementStyle(array $element, int $index): void
    {
        $style = $element['style'] ?? null;

        if (! is_array($style)) {
            return;
        }

        if (array_key_exists('fontSize', $style)) {
            $fontSize = $this->finiteNumber($style['fontSize']);

            if ($fontSize === null || $fontSize < 1 || $fontSize > 512) {
                throw ValidationException::withMessages([
                    "canvas.elements.{$index}.style.fontSize" => 'O tamanho de fonte precisa ser um número seguro.',
                ]);
            }
        }

        if (array_key_exists('align', $style)
            && ! in_array($style['align'], ['left', 'center', 'right'], true)
        ) {
            throw ValidationException::withMessages([
                "canvas.elements.{$index}.style.align" => 'O alinhamento do texto é inválido.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function validateElementName(array $element, int $index): void
    {
        if (! array_key_exists('name', $element)) {
            return;
        }

        if (! is_string($element['name']) || Str::length($element['name']) > self::MAX_ELEMENT_NAME_LENGTH) {
            throw ValidationException::withMessages([
                "canvas.elements.{$index}.name" => 'O nome da camada precisa ser um texto curto.',
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $element
     */
    private function validateElementBoolean(array $element, int $index, string $field): void
    {
        if (! array_key_exists($field, $element)) {
            return;
        }

        if (! is_bool($element[$field])) {
            throw ValidationException::withMessages([
                "canvas.elements.{$index}.{$field}" => 'Estados de camada precisam usar boolean.',
            ]);
        }
    }

    private function finiteNumber(mixed $value): ?float
    {
        if (! is_int($value) && ! is_float($value) && ! (is_string($value) && is_numeric($value))) {
            return null;
        }

        $number = (float) $value;

        return is_finite($number) ? $number : null;
    }
}
