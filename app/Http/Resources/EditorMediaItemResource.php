<?php

namespace App\Http\Resources;

use App\Domain\Media\Models\MediaItem;
use BackedEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MediaItem
 */
class EditorMediaItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => 'image',
            'originalFilename' => $this->original_filename,
            'url' => route('app.gifts.media.show', [$this->gift_id, $this->id], false),
            'thumbnailUrl' => $this->thumbnailUrl(),
            'width' => $this->width,
            'height' => $this->height,
            'sizeBytes' => $this->size_bytes,
            'status' => $this->statusValue(),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }

    private function thumbnailUrl(): ?string
    {
        $thumbnail = data_get($this->variants, 'thumbnail.storage_path')
            ?? data_get($this->variants, 'thumbnail');

        return is_string($thumbnail) && $thumbnail !== ''
            ? route('app.gifts.media.thumbnail', [$this->gift_id, $this->id], false)
            : null;
    }

    private function statusValue(): string
    {
        $status = $this->status;

        return $status instanceof BackedEnum ? $status->value : (string) $status;
    }
}
