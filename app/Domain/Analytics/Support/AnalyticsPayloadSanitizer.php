<?php

namespace App\Domain\Analytics\Support;

use Illuminate\Support\Str;

final class AnalyticsPayloadSanitizer
{
    private const MAX_DEPTH = 5;

    /**
     * @var array<int, string>
     */
    private const BLOCKED_KEYS = [
        '_token',
        'body',
        'content',
        'email',
        'file',
        'file_name',
        'filename',
        'html',
        'ip',
        'ip_address',
        'letter',
        'message',
        'name',
        'original_filename',
        'password',
        'password_confirmation',
        'public_code',
        'raw_payload',
        'recipient_name',
        'remote_addr',
        'remember_token',
        'sender_name',
        'src',
        'storage_path',
        'text',
        'title',
        'token',
        'ua',
        'url',
        'user_agent',
    ];

    /**
     * @param  array<string, mixed>|null  $payload
     * @return array<string, mixed>|null
     */
    public function sanitize(?array $payload): ?array
    {
        if ($payload === null || $payload === []) {
            return null;
        }

        $sanitized = $this->sanitizeValue($payload, 0);

        if (! is_array($sanitized) || $sanitized === []) {
            return null;
        }

        return $this->limitEncodedSize($sanitized);
    }

    private function sanitizeValue(mixed $value, int $depth): mixed
    {
        if ($depth > self::MAX_DEPTH) {
            return '[truncated]';
        }

        if (is_array($value)) {
            $sanitized = [];

            foreach ($value as $key => $item) {
                if (! is_string($key) && ! is_int($key)) {
                    continue;
                }

                if (is_string($key) && $this->isBlockedKey($key)) {
                    continue;
                }

                $cleanItem = $this->sanitizeValue($item, $depth + 1);

                if ($cleanItem !== null) {
                    $sanitized[$key] = $cleanItem;
                }
            }

            return $sanitized;
        }

        if (is_string($value)) {
            $value = trim($value);

            if ($value === '') {
                return null;
            }

            return Str::limit($value, (int) config('scrapbook.analytics.max_payload_string_length', 240), '');
        }

        if (is_bool($value) || is_int($value) || is_float($value)) {
            return $value;
        }

        return null;
    }

    private function isBlockedKey(string $key): bool
    {
        $normalized = Str::of($key)
            ->replace('-', '_')
            ->snake()
            ->lower()
            ->toString();

        return in_array($normalized, self::BLOCKED_KEYS, true)
            || str_ends_with($normalized, '_token')
            || str_contains($normalized, 'password')
            || str_contains($normalized, 'storage_path');
    }

    /**
     * @param  array<string|int, mixed>  $payload
     * @return array<string, mixed>|null
     */
    private function limitEncodedSize(array $payload): ?array
    {
        $maxBytes = max(1024, (int) config('scrapbook.analytics.max_payload_bytes', 8192));
        $encoded = json_encode($payload);

        if ($encoded === false || strlen($encoded) <= $maxBytes) {
            /** @var array<string, mixed> $payload */
            return $payload;
        }

        return [
            '_truncated' => true,
            '_reason' => 'payload_too_large',
        ];
    }
}
