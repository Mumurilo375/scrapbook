<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Gifts\Models\Gift;

final class PublicGiftResolver
{
    public function resolve(string $slugToken): ?Gift
    {
        [$slug, $publicCode] = $this->parseSlugToken($slugToken);

        if ($slug === null || $publicCode === null) {
            return null;
        }

        return Gift::query()
            ->publiclyAccessible()
            ->where('slug', $slug)
            ->where('public_code', $publicCode)
            ->first();
    }

    public function slugToken(Gift $gift): ?string
    {
        if (! is_string($gift->slug) || $gift->slug === '') {
            return null;
        }

        if (! is_string($gift->public_code) || $gift->public_code === '') {
            return null;
        }

        return $gift->slug.'-'.$gift->public_code;
    }

    /**
     * @return array{string|null, string|null}
     */
    private function parseSlugToken(string $slugToken): array
    {
        $separatorPosition = strrpos($slugToken, '-');

        if ($separatorPosition === false || $separatorPosition === 0 || $separatorPosition === strlen($slugToken) - 1) {
            return [null, null];
        }

        $slug = substr($slugToken, 0, $separatorPosition);
        $publicCode = substr($slugToken, $separatorPosition + 1);

        if (! preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            return [null, null];
        }

        if (! preg_match('/^[A-Za-z0-9]{16,64}$/', $publicCode)) {
            return [null, null];
        }

        return [$slug, $publicCode];
    }
}
