<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Services\GiftShareCardData;

final readonly class GenerateGiftQrCard
{
    public function __construct(private GiftShareCardData $shareCardData) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(Gift $gift): array
    {
        return [
            'status' => 'ready_on_demand',
            'card' => $this->shareCardData->forGift($gift),
        ];
    }
}
