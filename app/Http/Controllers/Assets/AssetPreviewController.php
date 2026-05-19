<?php

namespace App\Http\Controllers\Assets;

use App\Domain\Assets\Models\Asset;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssetPreviewController extends Controller
{
    public function __invoke(Request $request, Asset $asset): StreamedResponse
    {
        $canPreviewAsStaff = $this->userCanPreviewInactiveAsset($request->user());

        abort_unless($asset->is_active || $canPreviewAsStaff, 404);
        abort_unless($asset->mime_type !== 'image/svg+xml' || $canPreviewAsStaff, 404);
        abort_unless(filled($asset->storage_path), 404);

        $disk = Storage::disk($asset->storage_disk ?: (string) config('scrapbook.assets.disk', config('filesystems.default')));
        $path = $asset->storage_path;

        abort_unless($disk->exists($path), 404);

        $stream = $disk->readStream($path);

        abort_unless(is_resource($stream), 404);

        return response()->stream(function () use ($stream): void {
            fpassthru($stream);

            if (is_resource($stream)) {
                fclose($stream);
            }
        }, 200, [
            'Cache-Control' => $asset->is_active ? 'public, max-age=31536000, immutable' : 'private, no-store',
            'Content-Disposition' => 'inline',
            'Content-Type' => $asset->mime_type ?: ($disk->mimeType($path) ?: 'application/octet-stream'),
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function userCanPreviewInactiveAsset(?User $user): bool
    {
        return $user?->hasAnyRole(['admin', 'support']) ?? false;
    }
}
