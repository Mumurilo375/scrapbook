<?php

namespace App\Domain\Assets\Services;

use App\Domain\Assets\Models\Asset;

final class AssetUrlResolver
{
    public function previewUrl(Asset $asset): ?string
    {
        if (! filled($asset->storage_path)) {
            return $this->safeConfiguredPublicUrl($asset->public_url);
        }

        return route('assets.preview', $asset, false);
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
