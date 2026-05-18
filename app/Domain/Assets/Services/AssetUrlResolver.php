<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;
use Illuminate\Support\Facades\Storage;
use Throwable;

final class AssetUrlResolver
{
    public function previewUrl(Asset $asset): ?string
    {
        $publicUrl = $this->safeConfiguredPublicUrl($asset->public_url);

        if ($publicUrl !== null) {
            return $publicUrl;
        }

        if (! filled($asset->storage_path)) {
            return null;
        }

        try {
            return Storage::disk($asset->storage_disk ?: 'public')->url($asset->storage_path);
        } catch (Throwable) {
            return null;
        }
    }

    private function safeConfiguredPublicUrl(?string $url): ?string
    {
        if (! is_string($url)) {
            return null;
        }

        $url = trim($url);

        if ($url === '' || str_starts_with($url, '//')) {
            return null;
        }

        return str_starts_with($url, '/') ? $url : null;
    }
}
