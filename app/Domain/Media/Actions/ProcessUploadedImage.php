<?php

namespace App\Domain\Media\Actions;

use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use RuntimeException;

final class ProcessUploadedImage
{
    public function handle(MediaItem $mediaItem): MediaItem
    {
        $type = $mediaItem->getAttribute('type');
        $type = $type instanceof MediaType ? $type : MediaType::from((string) $type);

        if ($type !== MediaType::Image) {
            throw new RuntimeException('Only image media can be processed by this action.');
        }

        throw new RuntimeException('Image processing is not implemented yet; integrate the storage pipeline before enabling this action.');
    }
}
