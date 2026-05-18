<?php

namespace App\Domain\Themes;

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
            'book' => self::onlyKeys($config['book'] ?? [], ['style', 'binding', 'background', 'spineColor']),
            'page' => [
                ...self::onlyKeys($config['page'] ?? [], ['surface', 'backgroundColor', 'texture', 'textureAssetRole', 'edge', 'borderRadius', 'shadow', 'padding']),
                'decorations' => self::onlyKeys(data_get($config, 'page.decorations', []), ['cornerTape', 'paperGrain', 'subtleStains', 'edgeWear']),
            ],
            'elements' => [
                'text' => self::onlyKeys(data_get($config, 'elements.text', []), ['defaultColor', 'headingColor']),
                'image' => self::onlyKeys(data_get($config, 'elements.image', []), ['defaultFrame', 'shadow']),
                'sticker' => self::onlyKeys(data_get($config, 'elements.sticker', []), ['shadow', 'defaultShadow']),
            ],
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
}
