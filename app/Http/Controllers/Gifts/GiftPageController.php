<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Actions\UpdateGiftPageCanvas;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Gifts\UpdateGiftPageCanvasRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class GiftPageController extends Controller
{
    public function update(
        UpdateGiftPageCanvasRequest $request,
        Gift $gift,
        GiftPage $giftPage,
        UpdateGiftPageCanvas $updateGiftPageCanvas,
    ): RedirectResponse|JsonResponse {
        $updatedPage = $updateGiftPageCanvas->handle($request->user(), $giftPage, $request->validated('canvas'));

        if ($request->expectsJson()) {
            return response()->json([
                'data' => [
                    'page' => [
                        'id' => $updatedPage->id,
                        'canvas' => $updatedPage->canvas,
                        'updated_at' => $updatedPage->updated_at?->toIso8601String(),
                    ],
                    'gift' => [
                        'id' => $gift->id,
                        'last_edited_at' => $updatedPage->gift->last_edited_at?->toIso8601String(),
                    ],
                ],
                'message' => 'Página salva.',
            ]);
        }

        return back()->with('status', 'Página salva.');
    }
}
