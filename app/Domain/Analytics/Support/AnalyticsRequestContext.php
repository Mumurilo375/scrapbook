<?php

namespace App\Domain\Analytics\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

final readonly class AnalyticsRequestContext
{
    /**
     * @return array{device_type: string|null, browser: string|null, os: string|null}
     */
    public function userAgentSummary(?string $userAgent): array
    {
        $agent = strtolower((string) $userAgent);

        return [
            'device_type' => $this->deviceType($agent),
            'browser' => $this->browser($agent),
            'os' => $this->os($agent),
        ];
    }

    public function path(Request $request): string
    {
        $route = $request->route();
        $uri = is_object($route) && method_exists($route, 'uri') ? $route->uri() : null;
        $path = is_string($uri) && $uri !== '' ? '/'.ltrim($uri, '/') : '/'.ltrim($request->path(), '/');

        return $path === '/.' ? '/' : Str::limit($path, 2048, '');
    }

    public function referrer(Request $request): ?string
    {
        $referrer = $request->headers->get('referer');

        if (! is_string($referrer) || trim($referrer) === '') {
            return null;
        }

        $parts = parse_url($referrer);

        if (! is_array($parts)) {
            return null;
        }

        $host = $parts['host'] ?? null;

        if (! is_string($host) || $host === '') {
            return null;
        }

        $scheme = is_string($parts['scheme'] ?? null) ? $parts['scheme'].'://' : '';
        $path = is_string($parts['path'] ?? null) ? $this->maskSensitivePublicPath($parts['path']) : '';

        return Str::limit($scheme.$host.$path, 2048, '');
    }

    public function referrerHost(Request $request): ?string
    {
        $referrer = $request->headers->get('referer');

        if (! is_string($referrer) || trim($referrer) === '') {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        return is_string($host) && $host !== '' ? Str::limit($host, 255, '') : null;
    }

    public function publicSource(Request $request): string
    {
        $source = $request->query('src');

        if (in_array($source, ['qr', 'share_card', 'copy_link', 'link'], true)) {
            return (string) $source;
        }

        if ($this->referrerHost($request) !== null) {
            return 'link';
        }

        return 'direct';
    }

    public function locale(Request $request): ?string
    {
        $locale = $request->getPreferredLanguage();

        return is_string($locale) && $locale !== '' ? Str::limit($locale, 32, '') : null;
    }

    private function deviceType(string $agent): ?string
    {
        if ($agent === '') {
            return null;
        }

        if (str_contains($agent, 'tablet') || str_contains($agent, 'ipad')) {
            return 'tablet';
        }

        if (str_contains($agent, 'mobi') || str_contains($agent, 'iphone') || str_contains($agent, 'android')) {
            return 'mobile';
        }

        return 'desktop';
    }

    private function browser(string $agent): ?string
    {
        if ($agent === '') {
            return null;
        }

        return match (true) {
            str_contains($agent, 'edg/') => 'edge',
            str_contains($agent, 'chrome/') || str_contains($agent, 'crios/') => 'chrome',
            str_contains($agent, 'safari/') && ! str_contains($agent, 'chrome/') => 'safari',
            str_contains($agent, 'firefox/') || str_contains($agent, 'fxios/') => 'firefox',
            default => 'other',
        };
    }

    private function os(string $agent): ?string
    {
        if ($agent === '') {
            return null;
        }

        return match (true) {
            str_contains($agent, 'iphone') || str_contains($agent, 'ipad') || str_contains($agent, 'ios') => 'ios',
            str_contains($agent, 'android') => 'android',
            str_contains($agent, 'windows') => 'windows',
            str_contains($agent, 'mac os') || str_contains($agent, 'macintosh') => 'macos',
            str_contains($agent, 'linux') => 'linux',
            default => 'other',
        };
    }

    private function maskSensitivePublicPath(string $path): string
    {
        if (str_starts_with($path, '/p/')) {
            return '/p/{slugToken}';
        }

        return $path;
    }
}
