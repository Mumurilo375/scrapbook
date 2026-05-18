<?php

namespace App\Domain\Payments\Providers;

use App\Domain\Payments\Contracts\PaymentProvider;
use App\Domain\Payments\Data\CheckoutSessionData;
use App\Domain\Payments\Models\Order;

final class ManualDevPaymentProvider implements PaymentProvider
{
    public function createCheckout(Order $order): CheckoutSessionData
    {
        return new CheckoutSessionData(
            provider: 'manual_dev',
            providerReference: 'manual_dev_'.$order->id,
            metadata: [
                'mode' => 'manual_dev',
                'real_charge' => false,
            ],
        );
    }
}
