<?php

namespace App\Domain\Payments;

use App\Domain\Payments\Contracts\PaymentProvider;
use App\Domain\Payments\Providers\ManualDevPaymentProvider;
use InvalidArgumentException;

final class PaymentProviderManager
{
    public function checkoutProvider(): PaymentProvider
    {
        return match ((string) config('scrapbook.payments.provider', 'manual_dev')) {
            'manual_dev' => app(ManualDevPaymentProvider::class),
            default => throw new InvalidArgumentException('Payment provider is not configured.'),
        };
    }
}
