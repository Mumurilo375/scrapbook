<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

final class ThemeAssetCatalog
{
    /**
     * @return Collection<int, Asset>
     */
    public function textureAssetsForGift(Gift $gift): Collection
    {
        $gift->loadMissing('themeVersion');

        if (! $gift->themeVersion instanceof ThemeVersion) {
            return collect();
        }

        return $this->textureAssetsForThemeVersion($gift->themeVersion);
    }

    /**
     * @return Collection<int, Asset>
     */
    public function textureAssetsForThemeVersion(ThemeVersion $themeVersion): Collection
    {
        $references = ThemeConfig::textureAssetReferences($themeVersion->config);
        $roles = $references['roles'];
        $assetIds = $references['assetIds'];

        if ($roles === [] && $assetIds === []) {
            return collect();
        }

        return $themeVersion
            ->assets()
            ->with('category')
            ->where('assets.is_active', true)
            ->where(fn (Builder $query): Builder => $this->whereCategoryIsActiveOrEmpty($query))
            ->where(function (Builder $query) use ($roles, $assetIds): void {
                if ($roles !== []) {
                    $query->whereIn('theme_asset.role', $roles);
                }

                if ($assetIds !== []) {
                    if ($roles === []) {
                        $query->whereIn('assets.id', $assetIds);
                    } else {
                        $query->orWhereIn('assets.id', $assetIds);
                    }
                }
            })
            ->orderBy('theme_asset.sort_order')
            ->orderBy('assets.name')
            ->get()
            ->each(function (Asset $asset): void {
                $asset->setAttribute('editor_source', 'theme');
                $asset->setAttribute('editor_role', $asset->pivot?->role);
                $asset->setAttribute('editor_theme_config', $this->decodePivotConfig($asset->pivot?->config));
            })
            ->unique('id')
            ->values();
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
