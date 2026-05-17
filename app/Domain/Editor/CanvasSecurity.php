<?php

namespace App\Domain\Editor;

use App\Domain\Gifts\Models\GiftPage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class CanvasSecurity
{
    public const DEFAULT_TEXT_MAX_LENGTH = 1000;

    /**
     * @param  array<string, mixed>  $canvas
     * @return array<string, mixed>
     */
    public function sanitizeAndValidate(array $canvas, int $textMaxLength = self::DEFAULT_TEXT_MAX_LENGTH): array
    {
        $canvas = $this->sanitizeStrings($canvas);

        $this->validate($canvas, $textMaxLength);

        return $canvas;
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

        if (! isset($canvas['elements']) || ! is_array($canvas['elements'])) {
            throw ValidationException::withMessages([
                'canvas.elements' => 'O canvas precisa ter uma lista de elementos.',
            ]);
        }

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
}
