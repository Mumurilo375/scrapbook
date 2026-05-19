<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Themes\ThemeConfig;
use Illuminate\Support\Str;

final readonly class GiftShareCardData
{
    public function __construct(private GiftShareUrlGenerator $urlGenerator) {}

    /**
     * @return array<string, mixed>
     */
    public function forGift(Gift $gift): array
    {
        $gift->loadMissing('themeVersion.theme');

        $publicUrl = $this->urlGenerator->publicUrlOrFail($gift, source: 'share_card');
        $themeConfig = ThemeConfig::publicConfig($gift->themeVersion?->config);
        $colors = data_get($themeConfig, 'tokens.colors', []);

        return [
            'title' => $this->shortText($gift->title, 'Um presente para você', 90),
            'recipient_name' => $this->nullableShortText($gift->recipient_name, 80),
            'sender_name' => $this->nullableShortText($gift->sender_name, 80),
            'instruction' => 'Escaneie para abrir seu presente',
            'public_url' => $publicUrl,
            'visible_url' => $this->visibleUrl($publicUrl),
            'theme' => [
                'name' => $gift->themeVersion?->theme?->name,
                'config' => $themeConfig,
            ],
            'palette' => [
                'background' => $this->color($colors['appBackground'] ?? null, '#F4E8D9'),
                'paper' => $this->color($colors['paper'] ?? null, '#FFF7EE'),
                'paper_alt' => $this->color($colors['paperAlt'] ?? null, '#F7E4C2'),
                'ink' => $this->color($colors['ink'] ?? null, '#221C19'),
                'muted_ink' => $this->color($colors['mutedInk'] ?? null, '#6F5A4A'),
                'accent' => $this->color($colors['accent'] ?? null, '#D93632'),
                'accent_soft' => $this->color($colors['accentSoft'] ?? null, '#EBC493'),
                'tape' => $this->color($colors['tape'] ?? null, '#D9B77E'),
                'leaf' => $this->color($colors['leaf'] ?? null, '#7E8F68'),
                'shadow' => $this->color($colors['shadow'] ?? null, 'rgba(58,36,24,0.22)'),
            ],
        ];
    }

    private function shortText(?string $value, string $fallback, int $limit): string
    {
        $value = trim((string) $value);

        return Str::limit($value !== '' ? $value : $fallback, $limit, '');
    }

    private function nullableShortText(?string $value, int $limit): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : Str::limit($value, $limit, '');
    }

    private function visibleUrl(string $publicUrl): string
    {
        $host = parse_url($publicUrl, PHP_URL_HOST);
        $path = parse_url($publicUrl, PHP_URL_PATH);

        if (is_string($host) && $host !== '' && is_string($path) && $path !== '') {
            return $host.$path;
        }

        return $publicUrl;
    }

    private function color(mixed $value, string $fallback): string
    {
        return is_string($value) && $value !== '' ? $value : $fallback;
    }
}
