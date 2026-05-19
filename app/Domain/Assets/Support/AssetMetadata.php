<?php

namespace App\Domain\Assets\Support;

use App\Domain\Assets\Enums\AssetType;
use BackedEnum;

final class AssetMetadata
{
    /**
     * @param  array<string, mixed>|null  $metadata
     * @return array<string, mixed>
     */
    public static function normalizeForVisualAsset(
        ?array $metadata,
        AssetType|string|null $type,
        int|string|null $width = null,
        int|string|null $height = null,
        bool $forceImageRenderMode = false,
    ): array {
        $metadata = is_array($metadata) ? $metadata : [];
        $typeValue = self::typeValue($type);
        $renderStyle = self::renderStyleForType($typeValue);
        [$defaultWidth, $defaultHeight] = self::defaultTransformSize(
            $typeValue,
            self::positiveInt($width),
            self::positiveInt($height),
        );

        $metadata['schemaVersion'] = 1;
        $metadata['renderStyle'] = self::nonEmptyString($metadata['renderStyle'] ?? null) ?? $renderStyle;
        $metadata['physical'] = self::physicalDefaults($typeValue, is_array($metadata['physical'] ?? null) ? $metadata['physical'] : []);
        $metadata['defaultTransform'] = self::defaultTransformDefaults(
            is_array($metadata['defaultTransform'] ?? null) ? $metadata['defaultTransform'] : [],
            $defaultWidth,
            $defaultHeight,
            $typeValue,
        );

        $editor = is_array($metadata['editor'] ?? null) ? $metadata['editor'] : [];
        $editor['renderMode'] = $forceImageRenderMode
            ? 'image'
            : (self::nonEmptyString($editor['renderMode'] ?? null) ?? 'image');
        $editor['defaultSize'] = is_array($editor['defaultSize'] ?? null)
            ? $editor['defaultSize']
            : [
                'w' => $metadata['defaultTransform']['w'],
                'h' => $metadata['defaultTransform']['h'],
            ];
        $metadata['editor'] = $editor;

        return $metadata;
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaultForAdminForm(): array
    {
        return [
            'schemaVersion' => 1,
            'renderStyle' => 'sticker',
            'physical' => [
                'whiteBorder' => true,
                'borderWidth' => 8,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 8,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => true,
            ],
            'defaultTransform' => [
                'w' => 220,
                'h' => 220,
                'rotation' => -4,
            ],
            'editor' => [
                'renderMode' => 'image',
                'defaultSize' => [
                    'w' => 220,
                    'h' => 220,
                ],
                'keywords' => [],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private static function physicalDefaults(string $type, array $overrides): array
    {
        $defaults = match ($type) {
            AssetType::Texture->value, AssetType::Background->value, AssetType::Overlay->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => false,
                'shadowIntensity' => 'none',
                'lift' => 0,
                'paperTexture' => false,
                'slightRotation' => false,
                'edgeHighlight' => false,
            ],
            AssetType::Paper->value, AssetType::Envelope->value, AssetType::Newspaper->value, AssetType::Cutout->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 6,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => true,
            ],
            AssetType::Tape->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => true,
                'shadowIntensity' => 'soft',
                'lift' => 3,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => true,
            ],
            AssetType::Frame->value, AssetType::Border->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 5,
                'paperTexture' => true,
                'slightRotation' => false,
                'edgeHighlight' => true,
            ],
            AssetType::Label->value => [
                'whiteBorder' => false,
                'borderWidth' => 2,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 5,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => true,
            ],
            AssetType::Stamp->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => true,
                'shadowIntensity' => 'soft',
                'lift' => 2,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => false,
            ],
            AssetType::Flower->value, AssetType::Decoration->value, AssetType::Icon->value, AssetType::Shape->value, AssetType::Doodle->value => [
                'whiteBorder' => false,
                'borderWidth' => 0,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 7,
                'paperTexture' => false,
                'slightRotation' => true,
                'edgeHighlight' => false,
            ],
            default => [
                'whiteBorder' => true,
                'borderWidth' => 8,
                'dropShadow' => true,
                'shadowIntensity' => 'medium',
                'lift' => 8,
                'paperTexture' => true,
                'slightRotation' => true,
                'edgeHighlight' => true,
            ],
        };

        return array_replace($defaults, $overrides);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, int>
     */
    private static function defaultTransformDefaults(array $overrides, int $width, int $height, string $type): array
    {
        $defaults = [
            'w' => $width,
            'h' => $height,
            'rotation' => in_array($type, [AssetType::Texture->value, AssetType::Background->value, AssetType::Overlay->value], true) ? 0 : -4,
        ];

        return [
            'w' => self::positiveInt($overrides['w'] ?? null) ?? $defaults['w'],
            'h' => self::positiveInt($overrides['h'] ?? null) ?? $defaults['h'],
            'rotation' => self::int($overrides['rotation'] ?? null) ?? $defaults['rotation'],
        ];
    }

    public static function renderStyleForType(string $type): string
    {
        return match ($type) {
            AssetType::Texture->value => 'texture',
            AssetType::Paper->value => 'paper',
            AssetType::Background->value => 'background',
            AssetType::Frame->value => 'frame',
            AssetType::Tape->value => 'tape',
            AssetType::Label->value => 'label',
            AssetType::Stamp->value => 'stamp',
            AssetType::Flower->value => 'flower',
            AssetType::Decoration->value, AssetType::Icon->value, AssetType::Shape->value, AssetType::Doodle->value => 'decoration',
            AssetType::Envelope->value, AssetType::Newspaper->value => 'paper',
            AssetType::Overlay->value => 'overlay',
            AssetType::Border->value => 'border',
            AssetType::Cutout->value => 'cutout',
            default => 'sticker',
        };
    }

    private static function defaultWidthForType(string $type): int
    {
        return match ($type) {
            AssetType::Tape->value => 260,
            AssetType::Paper->value, AssetType::Envelope->value, AssetType::Newspaper->value, AssetType::Cutout->value => 360,
            AssetType::Background->value, AssetType::Texture->value, AssetType::Overlay->value => 420,
            AssetType::Frame->value, AssetType::Border->value => 320,
            AssetType::Label->value => 240,
            AssetType::Stamp->value => 140,
            default => 180,
        };
    }

    private static function defaultHeightForType(string $type): int
    {
        return match ($type) {
            AssetType::Tape->value => 80,
            AssetType::Paper->value, AssetType::Envelope->value, AssetType::Newspaper->value, AssetType::Cutout->value => 260,
            AssetType::Background->value, AssetType::Texture->value, AssetType::Overlay->value => 300,
            AssetType::Frame->value, AssetType::Border->value => 240,
            AssetType::Label->value => 120,
            AssetType::Stamp->value => 140,
            default => 180,
        };
    }

    /**
     * @return array{0: int, 1: int}
     */
    private static function defaultTransformSize(string $type, ?int $sourceWidth, ?int $sourceHeight): array
    {
        $width = self::defaultWidthForType($type);
        $fallbackHeight = self::defaultHeightForType($type);

        if ($sourceWidth === null || $sourceHeight === null) {
            return [$width, $fallbackHeight];
        }

        $height = (int) round($width * ($sourceHeight / $sourceWidth));

        return [$width, max(40, min(700, $height))];
    }

    private static function typeValue(AssetType|string|null $type): string
    {
        if ($type instanceof BackedEnum) {
            return (string) $type->value;
        }

        return is_string($type) && $type !== '' ? $type : AssetType::Sticker->value;
    }

    private static function positiveInt(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        $value = (int) $value;

        return $value > 0 ? $value : null;
    }

    private static function int(mixed $value): ?int
    {
        return is_numeric($value) ? (int) $value : null;
    }

    private static function nonEmptyString(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
