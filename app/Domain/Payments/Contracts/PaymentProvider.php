<?php

namespace App\Domain\Payments\Contracts;

use App\Domain\Payments\Data\CheckoutSessionData;
use App\Domain\Payments\Models\Order;

interface PaymentProvider
{
    public function createCheckout(Order $order): CheckoutSessionData;
}
