<?php

namespace App\Http\Controllers\Payments;

use App\Domain\Payments\Actions\ProcessApprovedPayment;
use App\Domain\Payments\Models\Order;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DevPaymentApprovalController extends Controller
{
    public function __invoke(Request $request, Order $order, ProcessApprovedPayment $processApprovedPayment): RedirectResponse
    {
        abort_if(! $this->enabled(), 404);

        Gate::forUser($request->user())->authorize('devApprove', $order);

        $processApprovedPayment->handle($order, [
            'source' => 'manual_dev_route',
            'approved_by_user_id' => $request->user()->id,
        ]);

        return redirect()
            ->route('app.orders.show', $order)
            ->with('status', 'Pagamento aprovado no fluxo manual/dev.');
    }

    private function enabled(): bool
    {
        return ! app()->environment('production')
            && (bool) config('scrapbook.payments.dev_approval_enabled', true);
    }
}
