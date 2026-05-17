<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Actions\UpdateGiftPageCanvas;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Gifts\UpdateGiftPageCanvasRequest;
use Illuminate\Http\RedirectResponse;

class GiftPageController extends Controller
{
    public function update(
        UpdateGiftPageCanvasRequest $request,
        Gift $gift,
        GiftPage $giftPage,
        UpdateGiftPageCanvas $updateGiftPageCanvas,
    ): RedirectResponse {
        $updateGiftPageCanvas->handle($request->user(), $giftPage, $request->validated('canvas'));

        return back()->with('status', 'Página salva.');
    }
}
