<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use App\Domain\Assets\Support\PageBackgroundAssets;
use App\Domain\Gifts\Models\Gift;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class EditorAssetCatalog
{
    /**
     * @return Collection<int, Asset>
     */
    public function availableForGift(Gift $gift): Collection
    {
        $gift->loadMissing('themeVersion');

        $themeAssets = $gift->themeVersion
            ? $gift->themeVersion
                ->assets()
                ->with('category')
                ->where('assets.is_active', true)
                ->where(fn (Builder $query): Builder => $this->whereCategoryIsActiveOrEmpty($query))
                ->orderBy('theme_asset.sort_order')
                ->orderBy('assets.name')
                ->get()
                ->each(function (Asset $asset): void {
                    $asset->setAttribute('editor_source', 'theme');
                    $asset->setAttribute('editor_role', $asset->pivot?->role);
                    $asset->setAttribute('editor_theme_config', $this->decodePivotConfig($asset->pivot?->config));
                })
            : collect();

        $themeAssetIds = $themeAssets->pluck('id')->all();

        $globalAssets = Asset::query()
            ->with('category')
            ->where('is_active', true)
            ->whereNotIn('id', $themeAssetIds)
            ->whereDoesntHave('themeVersions')
            ->where(fn (Builder $query): Builder => $this->whereCategoryIsActiveOrEmpty($query))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->each(function (Asset $asset): void {
                $asset->setAttribute('editor_source', 'global');
                $asset->setAttribute('editor_role', null);
                $asset->setAttribute('editor_theme_config', null);
            });

        return $themeAssets->concat($globalAssets)->values();
    }

    /**
     * @return Collection<int, Asset>
     */
    public function decorativeAssetsForGift(Gift $gift): Collection
    {
        return $this->availableForGift($gift)
            ->filter(fn (Asset $asset): bool => PageBackgroundAssets::isDecorativeCanvasAsset(
                $asset,
                $this->editorRole($asset),
            ))
            ->values();
    }

    /**
     * @return Collection<int, Asset>
     */
    public function pageBackgroundsForGift(Gift $gift): Collection
    {
        return $this->availableForGift($gift)
            ->filter(fn (Asset $asset): bool => PageBackgroundAssets::isPageBackground(
                $asset,
                $this->editorRole($asset),
            ))
            ->values();
    }

    /**
     * @return Collection<int, AssetCategory>
     */
    public function activeCategories(): Collection
    {
        return AssetCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array<int, string>  $assetIds
     * @return Collection<int, Asset>
     */
    public function assetsForGiftByIds(Gift $gift, array $assetIds): Collection
    {
        $assetIds = array_values(array_unique(array_filter(
            array_map(fn (mixed $assetId): string => trim((string) $assetId), $assetIds),
            fn (string $assetId): bool => $assetId !== '',
        )));

        if ($assetIds === []) {
            return collect();
        }

        $gift->loadMissing('themeVersion');

        $themeAssets = $gift->themeVersion
            ? $gift->themeVersion
                ->assets()
                ->with('category')
                ->whereIn('assets.id', $assetIds)
                ->where('assets.is_active', true)
                ->where(fn (Builder $query): Builder => $this->whereCategoryIsActiveOrEmpty($query))
                ->orderBy('theme_asset.sort_order')
                ->orderBy('assets.name')
                ->get()
                ->each(function (Asset $asset): void {
                    $asset->setAttribute('editor_source', 'theme');
                    $asset->setAttribute('editor_role', $asset->pivot?->role);
                    $asset->setAttribute('editor_theme_config', $this->decodePivotConfig($asset->pivot?->config));
                })
            : collect();

        $themeAssetIds = $themeAssets->pluck('id')->all();

        $globalAssets = Asset::query()
            ->with('category')
            ->whereIn('id', $assetIds)
            ->where('is_active', true)
            ->whereNotIn('id', $themeAssetIds)
            ->whereDoesntHave('themeVersions')
            ->where(fn (Builder $query): Builder => $this->whereCategoryIsActiveOrEmpty($query))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->each(function (Asset $asset): void {
                $asset->setAttribute('editor_source', 'global');
                $asset->setAttribute('editor_role', null);
                $asset->setAttribute('editor_theme_config', null);
            });

        return $themeAssets
            ->concat($globalAssets)
            ->unique('id')
            ->values();
    }

    public function assetIsAllowedForGift(Gift $gift, Asset $asset): bool
    {
        if (! $asset->is_active) {
            return false;
        }

        if ($asset->category()->where('is_active', false)->exists()) {
            return false;
        }

        $gift->loadMissing('themeVersion');

        if ($gift->theme_version_id !== null
            && $asset->themeVersions()->whereKey($gift->theme_version_id)->exists()
        ) {
            return true;
        }

        return ! $asset->themeVersions()->exists();
    }

    public function assetIsAllowedDecorativeForGift(Gift $gift, Asset $asset): bool
    {
        if (! $this->assetIsAllowedForGift($gift, $asset)) {
            return false;
        }

        return PageBackgroundAssets::isDecorativeCanvasAsset($asset, $this->roleForGiftAsset($gift, $asset));
    }

    public function assetIsAllowedPageBackgroundForGift(Gift $gift, Asset $asset): bool
    {
        if (! $this->assetIsAllowedForGift($gift, $asset)) {
            return false;
        }

        return PageBackgroundAssets::isPageBackground($asset, $this->roleForGiftAsset($gift, $asset));
    }

    private function roleForGiftAsset(Gift $gift, Asset $asset): ?string
    {
        $gift->loadMissing('themeVersion');

        if ($gift->theme_version_id === null) {
            return null;
        }

        $themeVersion = $asset->themeVersions()
            ->whereKey($gift->theme_version_id)
            ->first();

        $role = $themeVersion?->pivot?->role;

        return is_string($role) && trim($role) !== '' ? trim($role) : null;
    }

    private function editorRole(Asset $asset): ?string
    {
        $role = $asset->getAttribute('editor_role');

        return is_string($role) && trim($role) !== '' ? trim($role) : null;
    }

    private function whereCategoryIsActiveOrEmpty(Builder $query): Builder
    {
        return $query->where(function (Builder $query): void {
            $query
                ->whereNull('asset_category_id')
                ->orWhereHas('category', fn (Builder $query): Builder => $query->where('is_active', true));
        });
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodePivotConfig(mixed $config): ?array
    {
        if (is_array($config)) {
            return $config;
        }

        if (! is_string($config) || trim($config) === '') {
            return null;
        }

        $decoded = json_decode($config, true);

        return is_array($decoded) ? $decoded : null;
    }
}
