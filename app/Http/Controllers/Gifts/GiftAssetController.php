<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Assets\Services\EditorAssetCatalog;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Http\Controllers\Controller;
use App\Http\Resources\EditorAssetCategoryResource;
use App\Http\Resources\EditorAssetResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class GiftAssetController extends Controller
{
    public function index(Request $request, Gift $gift, EditorAssetCatalog $assetCatalog): JsonResponse
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        if ($gift->statusEnum() !== GiftStatus::Draft) {
            throw ValidationException::withMessages([
                'gift' => 'Somente presentes em rascunho podem listar assets do editor.',
            ]);
        }

        $gift->loadMissing('themeVersion');

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => EditorAssetCategoryResource::collection($assetCatalog->activeCategories())->resolve($request),
                'assets' => EditorAssetResource::collection($assetCatalog->availableForGift($gift))->resolve($request),
            ],
        ]);
    }
}
