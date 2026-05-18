<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Gifts\Models\Gift;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class GiftShareUrlGenerator
{
    public function __construct(private PublicGiftResolver $publicGiftResolver) {}

    public function publicUrl(Gift $gift, bool $absolute = true): ?string
    {
        if (! $gift->isPubliclyAccessible()) {
            return null;
        }

        $slugToken = $this->publicGiftResolver->slugToken($gift);

        if ($slugToken === null) {
            return null;
        }

        return route('public.gifts.show', $slugToken, $absolute);
    }

    public function publicUrlOrFail(Gift $gift, bool $absolute = true): string
    {
        $publicUrl = $this->publicUrl($gift, $absolute);

        if ($publicUrl === null) {
            throw new NotFoundHttpException('Publique o presente para gerar o link final.');
        }

        return $publicUrl;
    }
}
