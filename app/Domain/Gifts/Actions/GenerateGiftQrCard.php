<?php

namespace App\Domain\Gifts\Actions;

use App\Domain\Gifts\Models\Gift;
use RuntimeException;

final class GenerateGiftQrCard
{
    /**
     * @return array{status: string, public_path: string}
     */
    public function handle(Gift $gift): array
    {
        if (! $gift->isPubliclyAccessible()) {
            throw new RuntimeException('QR card generation requires a published public gift.');
        }

        return [
            'status' => 'pending_generation',
            'public_path' => '/p/'.$gift->slug.'-'.$gift->public_code,
        ];
    }
}
