<?php

namespace App\Domain\Gifts\Data;

final readonly class GiftQrCode
{
    public function __construct(
        public string $payload,
        public string $svg,
        public string $filename,
    ) {}
}
