<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
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
