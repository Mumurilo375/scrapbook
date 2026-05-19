<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use App\Domain\Gifts\Models\Gift;
use Illuminate\Support\Collection;

final class RendererAssetCatalog
{
    public function __construct(
        private readonly EditorAssetCatalog $editorAssetCatalog,
        private readonly ThemeAssetCatalog $themeAssetCatalog,
    ) {}

    /**
     * @return Collection<int, Asset>
     */
    public function assetsForGift(Gift $gift, bool $includeHiddenElements = false): Collection
    {
        $referencedAssets = $this->editorAssetCatalog->assetsForGiftByIds(
            $gift,
            array_merge(
                $this->referencedStickerAssetIds($gift, $includeHiddenElements),
                $this->referencedPageBackgroundAssetIds($gift),
            ),
        );

        $textureAssets = $this->themeAssetCatalog->textureAssetsForGift($gift);

        return $textureAssets
            ->concat($referencedAssets)
            ->unique('id')
            ->values();
    }

    /**
     * @return array<int, string>
     */
    private function referencedStickerAssetIds(Gift $gift, bool $includeHiddenElements): array
    {
        $gift->loadMissing('pages');
        $assetIds = [];

        foreach ($gift->pages as $page) {
            $canvas = is_array($page->canvas) ? $page->canvas : [];
            $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];

            foreach ($elements as $element) {
                if (! is_array($element) || ($element['type'] ?? null) !== 'sticker') {
                    continue;
                }

                if (! $includeHiddenElements && ($element['hidden'] ?? false) === true) {
                    continue;
                }

                $assetId = $element['assetId'] ?? $element['asset_id'] ?? null;

                if (is_string($assetId) || is_int($assetId)) {
                    $assetId = trim((string) $assetId);

                    if ($assetId !== '') {
                        $assetIds[] = $assetId;
                    }
                }
            }
        }

        return array_values(array_unique($assetIds));
    }

    /**
     * @return array<int, string>
     */
    private function referencedPageBackgroundAssetIds(Gift $gift): array
    {
        $gift->loadMissing('pages');
        $assetIds = [];

        foreach ($gift->pages as $page) {
            $canvas = is_array($page->canvas) ? $page->canvas : [];
            $background = data_get($canvas, 'artboard.background');

            if (! is_array($background) || ($background['type'] ?? null) !== 'asset') {
                continue;
            }

            $assetId = $background['assetId'] ?? $background['asset_id'] ?? null;

            if (is_string($assetId) || is_int($assetId)) {
                $assetId = trim((string) $assetId);

                if ($assetId !== '') {
                    $assetIds[] = $assetId;
                }
            }
        }

        return array_values(array_unique($assetIds));
    }
}
