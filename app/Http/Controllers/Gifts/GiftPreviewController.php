<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\ViewerMediaUrlResolver;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Http\Controllers\Controller;
use App\Http\Resources\GiftViewerResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GiftPreviewController extends Controller
{
    public function __invoke(Request $request, Gift $gift): Response
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        $gift->load([
            'themeVersion.theme',
            'pages' => fn ($query) => $query
                ->where('is_visible', true)
                ->orderBy('sort_order'),
            'mediaItems' => fn ($query) => $query
                ->where('type', MediaType::Image->value)
                ->where('status', MediaStatus::Processed->value),
        ]);

        return Inertia::render('gifts/Preview/GiftPreview', [
            'gift' => (new GiftViewerResource($gift, ViewerMediaUrlResolver::CONTEXT_PREVIEW))->resolve($request),
        ]);
    }
}
