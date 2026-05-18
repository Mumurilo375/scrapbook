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
        $canvas = is_array($this->canvas) ? $this->canvas : [];
        $artboard = is_array($canvas['artboard'] ?? null) ? $canvas['artboard'] : [];
        $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];
        $safeArea = is_array($artboard['safeArea'] ?? null) ? $artboard['safeArea'] : CanvasNormalizer::DEFAULT_SAFE_AREA;

        return [
            'schemaVersion' => 1,
            'version' => 1,
            'artboard' => [
                'width' => $this->positiveNumber($artboard['width'] ?? null, CanvasNormalizer::DEFAULT_WIDTH),
                'height' => $this->positiveNumber($artboard['height'] ?? null, CanvasNormalizer::DEFAULT_HEIGHT),
                'unit' => 'px',
                'background' => is_array($artboard['background'] ?? null)
                    ? $this->sanitizeValue($artboard['background'])
                    : ['type' => 'theme'],
                'safeArea' => [
                    'top' => $this->nonNegativeNumber($safeArea['top'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['top']),
                    'right' => $this->nonNegativeNumber($safeArea['right'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['right']),
                    'bottom' => $this->nonNegativeNumber($safeArea['bottom'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['bottom']),
                    'left' => $this->nonNegativeNumber($safeArea['left'] ?? null, CanvasNormalizer::DEFAULT_SAFE_AREA['left']),
                ],
            ],
            'background' => is_array($canvas['background'] ?? null) ? $this->sanitizeValue($canvas['background']) : null,
            'elements' => collect($elements)
                ->filter(fn (mixed $element): bool => is_array($element))
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
        $element['w'] = $this->positiveNumber($element['w'] ?? null, 120);
        $element['h'] = $this->positiveNumber($element['h'] ?? null, 80);
        $element['rotation'] = $this->number($element['rotation'] ?? null, 0);
        $element['z'] = $this->number($element['z'] ?? null, $index);

        if ($element['type'] === 'image') {
            return $this->imageElementForViewer($element);
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

    private function enumValue(mixed $value): string
    {
        return $value instanceof BackedEnum ? $value->value : (string) $value;
    }
}
