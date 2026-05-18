<?php

namespace App\Http\Controllers\Gifts;

use App\Domain\Gifts\Actions\PublishGift;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Enums\OrderStatus;
use App\Domain\Payments\Models\Order;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class GiftPublicationController extends Controller
{
    public function __invoke(Request $request, Gift $gift, PublishGift $publishGift): RedirectResponse
    {
        Gate::forUser($request->user())->authorize('view', $gift);

        if ($gift->statusEnum() === GiftStatus::Published) {
            return redirect()
                ->route('app.gifts.review', $gift)
                ->with('status', 'Gift já publicado.');
        }

        $paidOrder = Order::query()
            ->where('user_id', $request->user()->id)
            ->where('gift_id', $gift->id)
            ->where('status', OrderStatus::Paid->value)
            ->latest('paid_at')
            ->first();

        if (! $paidOrder instanceof Order) {
            return redirect()
                ->route('app.gifts.checkout', $gift)
                ->with('status', 'Finalize o checkout antes de publicar o gift.');
        }

        $publishGift->handle($request->user(), $gift, paymentApproved: true);

        return redirect()
            ->route('app.gifts.review', $gift)
            ->with('status', 'Gift publicado após confirmação do pagamento.');
    }
}
