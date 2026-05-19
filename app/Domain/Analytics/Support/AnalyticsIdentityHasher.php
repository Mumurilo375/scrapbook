<?php

namespace App\Domain\Analytics\Support;

final class AnalyticsIdentityHasher
{
    public function hash(?string $value, string $scope): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        if ($value === '') {
            return null;
        }

        return hash('sha256', $this->salt().'|'.$scope.'|'.$value);
    }

    private function salt(): string
    {
        $salt = (string) config('scrapbook.analytics.hash_salt', '');

        if ($salt !== '') {
            return $salt;
        }

        $appKey = (string) config('app.key', '');

        return $appKey !== '' ? $appKey : 'scrapbook-analytics';
    }
}
