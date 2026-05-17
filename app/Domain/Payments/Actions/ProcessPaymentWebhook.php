<?php

namespace App\Domain\Payments\Actions;

use RuntimeException;

final class ProcessPaymentWebhook
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function handle(array $payload): never
    {
        throw new RuntimeException('Payment webhook processing requires a real provider integration before it can be enabled.');
    }
}
