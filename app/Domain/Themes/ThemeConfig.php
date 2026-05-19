<?php

namespace App\Domain\Themes;

use App\Domain\Assets\Support\ThemeAssetRoles;

final class ThemeConfig
{
    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'schemaVersion' => 1,
            'tokens' => [
                'colors' => [
                    'appBackground' => '#F3E7D3',
                    'bookBackground' => '#D8BE96',
                    'paper' => '#FFF8EC',
                    'paperAlt' => '#F7E4C2',
                    'ink' => '#3A2418',
                    'mutedInk' => '#7B5A43',
                    'accent' => '#8E2F2F',
                    'accentSoft' => '#D9A6A1',
                    'shadow' => 'rgba(58,36,24,0.22)',
                    'muted' => '#A77B55',
                    'tape' => '#D9B77E',
                    'leaf' => '#6E7C4F',
                ],
                'fonts' => [
                    'heading' => 'serif',
                    'body' => 'sans',
                    'handwritten' => 'script',
                ],
            ],
            'book' => [
                'style' => 'scrapbook',
                'binding' => 'left',
                'background' => '#F3E7D3',
                'spineColor' => '#7B4F32',
                'mode' => 'spread',
                'spineWidth' => 28,
                'spreadGap' => 0,
                'pageCurl' => 'subtle',
                'foldShadow' => true,
            ],
            'page' => [
                'surface' => 'kraft',
                'backgroundColor' => '#FFF8EC',
                'texture' => 'paper-grain',
                'textureAssetRole' => 'paper_texture',
                'edge' => 'soft-rounded',
                'borderRadius' => 28,
                'shadow' => 'deep-paper',
                'padding' => 56,
                'decorations' => [
                    'cornerTape' => true,
                    'paperGrain' => true,
                    'subtleStains' => true,
                    'edgeWear' => true,
                ],
            ],
            'textures' => [
                'appBackground' => [
                    'assetRole' => 'background_texture',
                    'opacity' => 0.72,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'fabricBackground' => [
                    'assetRole' => 'fabric_background',
                    'opacity' => 0.68,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'bookSurface' => [
                    'assetRole' => 'book_texture',
                    'opacity' => 0.58,
                    'blendMode' => 'overlay',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'bookSpine' => [
                    'assetRole' => 'spine_texture',
                    'opacity' => 0.62,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'pagePaper' => [
                    'assetRole' => 'paper_texture',
                    'opacity' => 0.82,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'kraftSurface' => [
                    'assetRole' => 'kraft_surface',
                    'opacity' => 0.74,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'pageOverlay' => [
                    'assetRole' => 'page_overlay',
                    'opacity' => 0.18,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'agingOverlay' => [
                    'assetRole' => 'aging_overlay',
                    'opacity' => 0.18,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'stainOverlay' => [
                    'assetRole' => 'stain_overlay',
                    'opacity' => 0.14,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
                'edgeOverlay' => [
                    'assetRole' => 'edge_overlay',
                    'opacity' => 0.32,
                    'blendMode' => 'multiply',
                    'size' => 'cover',
                    'position' => 'center',
                    'repeat' => 'no-repeat',
                ],
            ],
            'elements' => [
                'text' => [
                    'defaultColor' => '#3A2418',
                    'headingColor' => '#3A2418',
                ],
                'image' => [
                    'defaultFrame' => 'polaroid',
                    'shadow' => true,
                ],
                'sticker' => [
                    'shadow' => true,
                    'defaultShadow' => true,
                ],
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $config
     * @return array<string, mixed>
     */
    public static function normalize(?array $config): array
    {
        $config = is_array($config) ? $config : [];
        $sticker = data_get($config, 'elements.sticker', []);
        $colors = data_get($config, 'tokens.colors', []);
        $book = data_get($config, 'book', []);

        if (is_array($sticker)
            && ! array_key_exists('shadow', $sticker)
            && array_key_exists('defaultShadow', $sticker)
        ) {
            data_set($config, 'elements.sticker.shadow', (bool) data_get($config, 'elements.sticker.defaultShadow'));
        }

        if (is_array($colors)
            && ! array_key_exists('mutedInk', $colors)
            && array_key_exists('muted', $colors)
        ) {
            data_set($config, 'tokens.colors.mutedInk', data_get($config, 'tokens.colors.muted'));
        }

        if (is_array($colors)
            && is_array($book)
            && ! array_key_exists('bookBackground', $colors)
            && array_key_exists('background', $book)
        ) {
            data_set($config, 'tokens.colors.bookBackground', data_get($config, 'book.background'));
        }

        return self::mergeDefaults(self::defaults(), $config);
    }

    /**
     * @param  array<string, mixed>|null  $config
     * @return array<string, mixed>
     */
    public static function publicConfig(?array $config): array
    {
        $config = self::normalize($config);

        return [
            'schemaVersion' => 1,
            'tokens' => self::publicTokens($config['tokens'] ?? []),
            'book' => self::publicBook($config['book'] ?? []),
            'page' => [
                ...self::onlyKeys($config['page'] ?? [], ['surface', 'backgroundColor', 'texture', 'textureAssetRole', 'edge', 'borderRadius', 'shadow', 'padding']),
                'decorations' => self::onlyKeys(data_get($config, 'page.decorations', []), ['cornerTape', 'paperGrain', 'subtleStains', 'edgeWear']),
            ],
            'textures' => self::publicTextures($config['textures'] ?? []),
            'elements' => [
                'text' => self::onlyKeys(data_get($config, 'elements.text', []), ['defaultColor', 'headingColor']),
                'image' => self::onlyKeys(data_get($config, 'elements.image', []), ['defaultFrame', 'shadow']),
                'sticker' => self::onlyKeys(data_get($config, 'elements.sticker', []), ['shadow', 'defaultShadow']),
            ],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $config
     * @return array{roles: array<int, string>, assetIds: array<int, string>}
     */
    public static function textureAssetReferences(?array $config): array
    {
        $config = self::publicConfig($config);
        $roles = [];
        $assetIds = [];
        $legacyTextureRole = data_get($config, 'page.textureAssetRole');

        if (is_string($legacyTextureRole) && ThemeAssetRoles::isTextureRole($legacyTextureRole)) {
            $roles[] = $legacyTextureRole;
        }

        foreach (($config['textures'] ?? []) as $texture) {
            if (! is_array($texture)) {
                continue;
            }

            $role = $texture['assetRole'] ?? null;
            $assetId = $texture['assetId'] ?? null;

            if (is_string($role) && ThemeAssetRoles::isTextureRole($role)) {
                $roles[] = $role;
            }

            if (is_string($assetId) && self::safeAssetId($assetId) !== null) {
                $assetIds[] = $assetId;
            }
        }

        return [
            'roles' => array_values(array_unique($roles)),
            'assetIds' => array_values(array_unique($assetIds)),
        ];
    }

    /**
     * @param  array<string, mixed>  $defaults
     * @param  array<string, mixed>  $config
     * @return array<string, mixed>
     */
    private static function mergeDefaults(array $defaults, array $config): array
    {
        foreach ($defaults as $key => $defaultValue) {
            $configValue = $config[$key] ?? null;

            if (is_array($defaultValue) && is_array($configValue)) {
                $config[$key] = self::mergeDefaults($defaultValue, $configValue);

                continue;
            }

            if (! array_key_exists($key, $config)) {
                $config[$key] = $defaultValue;
            }
        }

        return $config;
    }

    /**
     * @param  array<string, mixed>  $tokens
     * @return array<string, mixed>
     */
    private static function publicTokens(array $tokens): array
    {
        return [
            'colors' => self::onlyKeys($tokens['colors'] ?? [], [
                'appBackground',
                'bookBackground',
                'paper',
                'paperAlt',
                'ink',
                'mutedInk',
                'accent',
                'accentSoft',
                'shadow',
                'muted',
                'tape',
                'leaf',
            ]),
            'fonts' => self::onlyKeys($tokens['fonts'] ?? [], ['heading', 'body', 'handwritten']),
        ];
    }

    /**
     * @param  array<string, mixed>|mixed  $book
     * @return array<string, mixed>
     */
    private static function publicBook(mixed $book): array
    {
        $book = is_array($book) ? $book : [];

        return [
            'style' => is_string($book['style'] ?? null) && trim($book['style']) !== ''
                ? trim($book['style'])
                : 'scrapbook',
            'binding' => ($book['binding'] ?? null) === 'none' ? 'none' : 'left',
            'background' => is_string($book['background'] ?? null) ? $book['background'] : '#F3E7D3',
            'spineColor' => is_string($book['spineColor'] ?? null) ? $book['spineColor'] : '#7B4F32',
            'mode' => ($book['mode'] ?? null) === 'single' ? 'single' : 'spread',
            'spineWidth' => self::clampedNumber($book['spineWidth'] ?? null, 28, 8, 72),
            'spreadGap' => self::clampedNumber($book['spreadGap'] ?? null, 0, 0, 32),
            'pageCurl' => ($book['pageCurl'] ?? null) === 'none' ? 'none' : 'subtle',
            'foldShadow' => is_bool($book['foldShadow'] ?? null) ? $book['foldShadow'] : true,
        ];
    }

    /**
     * @param  array<string, mixed>  $textures
     * @return array<string, array<string, mixed>>
     */
    private static function publicTextures(array $textures): array
    {
        $publicTextures = [];

        foreach (self::textureSlots() as $slot) {
            $texture = $textures[$slot] ?? null;

            if (! is_array($texture)) {
                continue;
            }

            $publicTexture = self::publicTextureLayer($texture);

            if ($publicTexture !== null) {
                $publicTextures[$slot] = $publicTexture;
            }
        }

        return $publicTextures;
    }

    /**
     * @return array<int, string>
     */
    private static function textureSlots(): array
    {
        return [
            'appBackground',
            'fabricBackground',
            'bookSurface',
            'bookSpine',
            'pagePaper',
            'kraftSurface',
            'pageOverlay',
            'agingOverlay',
            'stainOverlay',
            'edgeOverlay',
        ];
    }

    /**
     * @param  array<string, mixed>  $texture
     * @return array<string, mixed>|null
     */
    private static function publicTextureLayer(array $texture): ?array
    {
        $assetRole = self::safeTextureRole($texture['assetRole'] ?? $texture['role'] ?? null);
        $assetId = self::safeAssetId($texture['assetId'] ?? null);

        if ($assetRole === null && $assetId === null) {
            return null;
        }

        $layer = [];

        if ($assetRole !== null) {
            $layer['assetRole'] = $assetRole;
        }

        if ($assetId !== null) {
            $layer['assetId'] = $assetId;
        }

        $layer['opacity'] = self::opacity($texture['opacity'] ?? null, 1.0);
        $layer['blendMode'] = self::safeBlendMode($texture['blendMode'] ?? null);
        $layer['size'] = self::safeBackgroundSize($texture['size'] ?? null);
        $layer['position'] = self::safeBackgroundPosition($texture['position'] ?? null);
        $layer['repeat'] = self::safeBackgroundRepeat($texture['repeat'] ?? null);

        return $layer;
    }

    /**
     * @param  array<string, mixed>|mixed  $value
     * @param  array<int, string>  $keys
     * @return array<string, mixed>
     */
    private static function onlyKeys(mixed $value, array $keys): array
    {
        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->only($keys)
            ->filter(fn (mixed $item): bool => is_scalar($item) || $item === null)
            ->all();
    }

    private static function safeTextureRole(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return ThemeAssetRoles::isTextureRole($value) ? $value : null;
    }

    private static function safeAssetId(mixed $value): ?string
    {
        if (! is_string($value) && ! is_int($value)) {
            return null;
        }

        $value = trim((string) $value);

        return preg_match('/^[A-Za-z0-9_-]{4,80}$/', $value) === 1 ? $value : null;
    }

    private static function opacity(mixed $value, float $fallback): float
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        return max(0.0, min(1.0, round((float) $value, 3)));
    }

    private static function clampedNumber(mixed $value, int|float $fallback, int|float $min, int|float $max): int|float
    {
        if (! is_numeric($value)) {
            return $fallback;
        }

        return max($min, min($max, $value + 0));
    }

    private static function safeBlendMode(mixed $value): string
    {
        if (! is_string($value)) {
            return 'normal';
        }

        return in_array($value, [
            'normal',
            'multiply',
            'screen',
            'overlay',
            'darken',
            'lighten',
            'soft-light',
            'hard-light',
            'color-burn',
            'luminosity',
        ], true) ? $value : 'normal';
    }

    private static function safeBackgroundSize(mixed $value): string
    {
        if (! is_string($value)) {
            return 'cover';
        }

        $value = trim($value);

        if (in_array($value, ['auto', 'cover', 'contain'], true)) {
            return $value;
        }

        return preg_match('/^(?:\d{1,4}(?:px|%)|auto)(?:\s+(?:\d{1,4}(?:px|%)|auto))?$/', $value) === 1
            ? $value
            : 'cover';
    }

    private static function safeBackgroundPosition(mixed $value): string
    {
        if (! is_string($value)) {
            return 'center';
        }

        $value = trim($value);

        return preg_match('/^(?:left|right|center|top|bottom|\d{1,3}%)(?:\s+(?:left|right|center|top|bottom|\d{1,3}%))?$/', $value) === 1
            ? $value
            : 'center';
    }

    private static function safeBackgroundRepeat(mixed $value): string
    {
        if (! is_string($value)) {
            return 'no-repeat';
        }

        return in_array($value, ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], true) ? $value : 'no-repeat';
    }
}
