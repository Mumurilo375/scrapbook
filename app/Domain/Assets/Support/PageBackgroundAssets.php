<?php

namespace App\Domain\Assets\Support;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use BackedEnum;

final class PageBackgroundAssets
{
    /**
     * @return array<int, string>
     */
    public static function allowedRoles(): array
    {
        return [
            ThemeAssetRoles::PAPER_TEXTURE,
            ThemeAssetRoles::KRAFT_SURFACE,
            ThemeAssetRoles::PAGE_BACKGROUND,
        ];
    }

    public static function isPageBackground(Asset $asset, ?string $role = null): bool
    {
        $type = self::typeValue($asset->type);

        if ($role !== null && in_array($role, self::allowedRoles(), true)) {
            return true;
        }

        if (in_array($type, [AssetType::Paper->value, AssetType::Texture->value], true)) {
            return true;
        }

        return $type === AssetType::Background->value && self::isMarkedForPageBackground($asset, $role);
    }

    public static function isDecorativeCanvasAsset(Asset $asset, ?string $role = null): bool
    {
        $type = self::typeValue($asset->type);

        if (self::isPageBackground($asset, $role)) {
            return false;
        }

        if ($role !== null && in_array($role, self::nonStickerRoles(), true)) {
            return false;
        }

        return ! in_array($type, [
            AssetType::Paper->value,
            AssetType::Texture->value,
            AssetType::Background->value,
        ], true);
    }

    private static function isMarkedForPageBackground(Asset $asset, ?string $role): bool
    {
        if ($role === ThemeAssetRoles::PAGE_BACKGROUND) {
            return true;
        }

        foreach ([
            data_get($asset->metadata, 'pageBackground'),
            data_get($asset->metadata, 'page_background'),
            data_get($asset->metadata, 'editor.pageBackground'),
            data_get($asset->metadata, 'editor.page_background'),
            data_get($asset->metadata, 'usage.pageBackground'),
            data_get($asset->metadata, 'usage.page_background'),
        ] as $value) {
            if ($value === true || $value === 'page_background' || $value === 'paper') {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<int, string>
     */
    private static function nonStickerRoles(): array
    {
        return [
            ThemeAssetRoles::PAPER_TEXTURE,
            ThemeAssetRoles::BACKGROUND_TEXTURE,
            ThemeAssetRoles::BOOK_TEXTURE,
            ThemeAssetRoles::SPINE_TEXTURE,
            ThemeAssetRoles::PAGE_OVERLAY,
            ThemeAssetRoles::EDGE_OVERLAY,
            ThemeAssetRoles::FABRIC_BACKGROUND,
            ThemeAssetRoles::KRAFT_SURFACE,
            ThemeAssetRoles::PAGE_BACKGROUND,
            ThemeAssetRoles::AGING_OVERLAY,
            ThemeAssetRoles::STAIN_OVERLAY,
        ];
    }

    private static function typeValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? (string) $value->value : (string) $value;
    }
}
