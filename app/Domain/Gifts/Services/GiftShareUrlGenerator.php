<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Gifts\Models\Gift;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final readonly class GiftShareUrlGenerator
{
    public function __construct(private PublicGiftResolver $publicGiftResolver) {}

    public function publicUrl(Gift $gift, bool $absolute = true, ?string $source = null): ?string
    {
        if (! $gift->isPubliclyAccessible()) {
            return null;
        }

        $slugToken = $this->publicGiftResolver->slugToken($gift);

        if ($slugToken === null) {
            return null;
        }

        $parameters = [$slugToken];

        if (in_array($source, ['qr', 'share_card', 'copy_link'], true)) {
            $parameters['src'] = $source;
        }

        return route('public.gifts.show', $parameters, $absolute);
    }

    public function publicUrlOrFail(Gift $gift, bool $absolute = true, ?string $source = null): string
    {
        $publicUrl = $this->publicUrl($gift, $absolute, $source);

        if ($publicUrl === null) {
            throw new NotFoundHttpException('Publique o presente para gerar o link final.');
        }

        return $publicUrl;
    }
}
