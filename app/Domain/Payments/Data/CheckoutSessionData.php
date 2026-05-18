<?php

namespace App\Domain\Payments\Data;

final readonly class CheckoutSessionData
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public string $provider,
        public ?string $providerReference = null,
        public ?string $checkoutUrl = null,
        public array $metadata = [],
    ) {}
}
