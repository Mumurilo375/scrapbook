<?php

namespace App\Http\Resources;

use App\Domain\Editor\CanvasNormalizer;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use App\Domain\Media\Models\MediaItem;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin GiftPage
 */
class GiftPageViewerResource extends JsonResource
{
    public function __construct(
        GiftPage $resource,
        private readonly Gift $gift,
        private readonly string $mediaContext,
    ) {
        parent::__construct($resource);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'page_type' => $this->enumValue($this->page_type),
            'sort_order' => $this->sort_order,
            'canvas' => $this->canvasForViewer(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function canvasForViewer(): array
    {
        $rawCanvas = $this->resource->getAttribute('canvas');
        $canvas = is_array($rawCanvas) ? $rawCanvas : [];
        $rawArtboard = $canvas['artboard'] ?? null;
        $artboard = is_array($rawArtboard) ? $rawArtboard : [];
        $rawElements = $canvas['elements'] ?? null;
        $elements = is_array($rawElements) ? $rawElements : [];
        $rawSafeArea = $artboard['safeArea'] ?? null;
        $safeArea = is_array($rawSafeArea) ? $rawSafeArea : CanvasNormalizer::DEFAULT_SAFE_AREA;

        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => $this->positiveNumber($artboard['width'] ?? null, CanvasNormalizer::DEFAULT_WIDTH),
                'height' => $this->positiveNumber($artboard['height'] ?? null, CanvasNormalizer::DEFAULT_HEIGHT),
                'unit' => 'px',
                'background' => $this->pageBackgroundForViewer($artboard['background'] ?? null),
                'safeArea' => [
                    'top' => $this->nonNegativeNumber($safeArea['top'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['top']),
                    'right' => $this->nonNegativeNumber($safeArea['right'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['right']),
                    'bottom' => $this->nonNegativeNumber($safeArea['bottom'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['bottom']),
                    'left' => $this->nonNegativeNumber($safeArea['left'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['left']),
                ],
            ],
            'background' => $this->legacyBackgroundForViewer($canvas['background'] ?? null),
            'elements' => collect($elements)
                ->filter(fn (mixed $element): bool => is_array($element) && ($element['hidden'] ?? false) !== true)
                ->map(fn (array $element, int $index): array => $this->elementForViewer($element, $index))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function elementForViewer(array $element, int $index): array
    {
        $element = $this->sanitizeValue($element);
        $element['id'] = is_string($element['id'] ?? null) && $element['id'] !== '' ? $element['id'] : 'element_'.$index;
        $element['type'] = is_string($element['type'] ?? null) && $element['type'] !== '' ? $element['type'] : 'unknown';
        $element['x'] = $this->number($element['x'] ?? null, 0);
        $element['y'] = $this->number($element['y'] ?? null, 0);
        $element['w'] = $this->positiveNumber($element['w'] ?? $element['width'] ?? null, 120);
        $element['h'] = $this->positiveNumber($element['h'] ?? $element['height'] ?? null, 80);
        $element['rotation'] = $this->number($element['rotation'] ?? null, 0);
        $element['z'] = $this->number($element['z'] ?? $element['zIndex'] ?? null, $index);
        $element['locked'] = ($element['locked'] ?? false) === true;
        $element['hidden'] = false;
        unset($element['width'], $element['height'], $element['zIndex']);

        if ($element['type'] === 'image') {
            return $this->imageElementForViewer($element);
        }

        if ($element['type'] === 'sticker') {
            return $this->stickerElementForViewer($element);
        }

        if ($element['type'] === 'flip_polaroid') {
            return $this->flipPolaroidElementForViewer($element);
        }

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function imageElementForViewer(array $element): array
    {
        unset($element['src'], $element['thumbnailSrc'], $element['thumbnail_url'], $element['media_item_id']);

        $mediaItemId = $element['mediaItemId'] ?? null;

        if (! is_string($mediaItemId) && ! is_int($mediaItemId)) {
            $element['missingMedia'] = true;

            return $element;
        }

        $mediaItem = $this->mediaItems()->get(trim((string) $mediaItemId));

        if (! $mediaItem instanceof MediaItem) {
            unset($element['mediaItemId']);
            $element['missingMedia'] = true;

            return $element;
        }

        $resolver = app(ViewerMediaUrlResolver::class);
        $url = $resolver->mediaUrl($this->gift, $mediaItem, $this->mediaContext);

        if ($url === null) {
            unset($element['mediaItemId']);
            $element['missingMedia'] = true;

            return $element;
        }

        $element['mediaItemId'] = $mediaItem->id;
        $element['src'] = $url;

        $thumbnailUrl = $resolver->thumbnailUrl($this->gift, $mediaItem, $this->mediaContext);

        if ($thumbnailUrl !== null) {
            $element['thumbnailSrc'] = $thumbnailUrl;
        }

        unset($element['missingMedia']);

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function stickerElementForViewer(array $element): array
    {
        unset($element['src'], $element['url'], $element['publicUrl'], $element['public_url'], $element['previewUrl'], $element['preview_url'], $element['assetUrl'], $element['asset_url'], $element['storage_path'], $element['storagePath'], $element['asset'], $element['renderMode']);

        $assetId = $element['assetId'] ?? $element['asset_id'] ?? null;

        if (is_string($assetId) || is_int($assetId)) {
            $assetId = trim((string) $assetId);

            if ($assetId !== '') {
                $element['assetId'] = $assetId;
            } else {
                unset($element['assetId']);
            }
        } else {
            unset($element['assetId']);
        }

        unset($element['asset_id']);

        return $element;
    }

    /**
     * @param  array<string, mixed>  $element
     * @return array<string, mixed>
     */
    private function flipPolaroidElementForViewer(array $element): array
    {
        $front = is_array($element['front'] ?? null) ? $element['front'] : [];
        $back = is_array($element['back'] ?? null) ? $element['back'] : [];

        foreach (['src', 'thumbnailSrc', 'thumbnail_url', 'media_item_id', 'url', 'publicUrl', 'public_url', 'previewUrl', 'preview_url', 'assetUrl', 'asset_url', 'storage_path', 'storagePath'] as $key) {
            unset($front[$key]);
        }

        foreach (['src', 'url', 'publicUrl', 'public_url', 'previewUrl', 'preview_url', 'assetUrl', 'asset_url', 'storage_path', 'storagePath'] as $key) {
            unset($back[$key]);
        }

        $mediaItemId = $front['mediaItemId'] ?? null;

        if (is_string($mediaItemId) || is_int($mediaItemId)) {
            $mediaItem = $this->mediaItems()->get(trim((string) $mediaItemId));
            $resolver = app(ViewerMediaUrlResolver::class);
            $url = $mediaItem instanceof MediaItem
                ? $resolver->mediaUrl($this->gift, $mediaItem, $this->mediaContext)
                : null;

            if ($mediaItem instanceof MediaItem && $url !== null) {
                $front['mediaItemId'] = $mediaItem->id;
                $front['src'] = $url;

                $thumbnailUrl = $resolver->thumbnailUrl($this->gift, $mediaItem, $this->mediaContext);

                if ($thumbnailUrl !== null) {
                    $front['thumbnailSrc'] = $thumbnailUrl;
                }
            } else {
                unset($front['mediaItemId']);
                $front['missingMedia'] = true;
            }
        } else {
            unset($front['mediaItemId']);
        }

        $element['front'] = $front;
        $element['back'] = $back;

        return $element;
    }

    /**
     * @return array<string, mixed>
     */
    private function pageBackgroundForViewer(mixed $background): array
    {
        if (! is_array($background) || ($background['type'] ?? null) !== 'asset') {
            return ['type' => 'theme'];
        }

        $assetId = $background['assetId'] ?? $background['asset_id'] ?? null;

        if (! is_string($assetId) && ! is_int($assetId)) {
            return ['type' => 'theme'];
        }

        $assetId = trim((string) $assetId);

        if ($assetId === '') {
            return ['type' => 'theme'];
        }

        return [
            'type' => 'asset',
            'assetId' => $assetId,
            'fit' => in_array($background['fit'] ?? null, ['cover', 'contain'], true) ? $background['fit'] : 'cover',
            'opacity' => $this->opacity($background['opacity'] ?? null),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function legacyBackgroundForViewer(mixed $background): ?array
    {
        if (! is_array($background)) {
            return null;
        }

        $type = $background['type'] ?? null;

        if ($type === 'themeToken' && is_string($background['value'] ?? null)) {
            return [
                'type' => 'themeToken',
                'value' => preg_replace('/[^A-Za-z0-9_-]/', '', $background['value']) ?: 'paper',
            ];
        }

        if (is_string($background['color'] ?? null) && preg_match('/^#[0-9a-f]{3,8}$/i', $background['color']) === 1) {
            return [
                'color' => $background['color'],
            ];
        }

        return null;
    }

    /**
     * @return Collection<string, MediaItem>
     */
    private function mediaItems(): Collection
    {
        if (! $this->gift->relationLoaded('mediaItems')) {
            return collect();
        }

        /** @var Collection<string, MediaItem> $mediaItems */
        $mediaItems = $this->gift->mediaItems->keyBy('id');

        return $mediaItems;
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<string, mixed>
     */
    private function sanitizeValue(array $value): array
    {
        foreach ($value as $key => $child) {
            if (is_array($child)) {
                $value[$key] = $this->sanitizeValue($child);

                continue;
            }

            if (! is_string($child)) {
                continue;
            }

            $child = str_replace("\0", '', $child);

            if (in_array(strtolower((string) $key), ['storage_path', 'storagepath'], true)) {
                unset($value[$key]);

                continue;
            }

            if (in_array(strtolower((string) $key), ['html', 'innerhtml'], true)) {
                unset($value[$key]);

                continue;
            }

            if (preg_match('/^\s*(?:javascript|data|vbscript):/i', $child) === 1) {
                unset($value[$key]);

                continue;
            }

            if (in_array(strtolower((string) $key), ['text', 'content'], true)) {
                $child = strip_tags(str_replace(["\r\n", "\r"], "\n", $child));

                if (preg_match('/(?:https?:)?\/\/[^\s]+/i', $child) === 1) {
                    $child = trim((string) preg_replace('/(?:https?:)?\/\/[^\s]+/i', '', $child));
                }
            } elseif (preg_match('/(?:https?:)?\/\/[^\s]+/i', $child) === 1) {
                unset($value[$key]);

                continue;
            }

            $value[$key] = $child;
        }

        return $value;
    }

    private function number(mixed $value, int|float $fallback): int|float
    {
        return is_numeric($value) ? $value + 0 : $fallback;
    }

    private function positiveNumber(mixed $value, int|float $fallback): int|float
    {
        $number = $this->number($value, $fallback);

        return $number > 0 ? $number : $fallback;
    }

    private function nonNegativeNumber(mixed $value, int|float $fallback): int|float
    {
        $number = $this->number($value, $fallback);

        return $number >= 0 ? $number : $fallback;
    }

    private function opacity(mixed $value): int|float
    {
        $number = $this->number($value, 1);

        return max(0, min(1, $number));
    }

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
