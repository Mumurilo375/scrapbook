<?php

namespace App\Domain\VisualQuality;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Support\PageBackgroundAssets;
use App\Domain\Assets\Support\ThemeAssetRoles;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use App\Domain\Themes\ThemeConfig;
use Illuminate\Support\Collection;

final class ThemeQualityChecker
{
    /**
     * @return array<int, VisualAuditIssue>
     */
    public function check(): array
    {
        $issues = [];

        ThemeVersion::query()
            ->with(['theme', 'assets.category'])
            ->where('status', ThemeVersionStatus::Published->value)
            ->orderBy('name')
            ->get()
            ->each(function (ThemeVersion $themeVersion) use (&$issues): void {
                array_push($issues, ...$this->checkPublishedThemeVersion($themeVersion));
            });

        return $issues;
    }

    /**
     * @return array<int, VisualAuditIssue>
     */
    private function checkPublishedThemeVersion(ThemeVersion $themeVersion): array
    {
        $issues = [];
        $label = $this->themeVersionLabel($themeVersion);
        $assets = $themeVersion->assets;
        $roles = $this->roles($assets);
        $config = $themeVersion->config;

        if (! in_array(ThemeAssetRoles::PAPER_TEXTURE, $roles, true)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema sem textura de papel',
                "A ThemeVersion {$label} não possui asset com role paper_texture.",
                'Associe um asset do tipo paper/texture com role paper_texture.',
            );
        }

        if (! in_array(ThemeAssetRoles::BACKGROUND_TEXTURE, $roles, true)) {
            $issues[] = VisualAuditIssue::make(
                'info',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema sem textura de fundo',
                "A ThemeVersion {$label} não possui asset com role background_texture.",
                'Associe um fundo externo real quando a direção de arte pedir mesa/tecido/textura.',
            );
        }

        if (! $this->hasDecorativeAssets($assets)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema sem assets decorativos',
                "A ThemeVersion {$label} não possui stickers, fitas, molduras ou decorações posicionáveis.",
                'Associe assets decorativos para o editor priorizar o tema durante a produção.',
            );
        }

        foreach ($assets as $asset) {
            if (! $asset->is_active) {
                $issues[] = VisualAuditIssue::make(
                    'error',
                    'theme',
                    'ThemeVersion',
                    $themeVersion->id,
                    'Tema publicado usando asset inativo',
                    "A ThemeVersion {$label} usa o asset inativo {$asset->name}.",
                    'Reative, substitua ou remova o asset do tema antes de publicar templates finais.',
                );
            }
        }

        array_push($issues, ...$this->checkDuplicateRoles($themeVersion, $roles, $label));
        array_push($issues, ...$this->checkConfig($themeVersion, $config, $label));

        return $issues;
    }

    /**
     * @param  Collection<int, Asset>  $assets
     * @return array<int, string>
     */
    private function roles(Collection $assets): array
    {
        return $assets
            ->map(fn (Asset $asset): mixed => $asset->pivot?->role)
            ->filter(fn (mixed $role): bool => is_string($role) && trim($role) !== '')
            ->map(fn (mixed $role): string => trim((string) $role))
            ->values()
            ->all();
    }

    /**
     * @param  Collection<int, Asset>  $assets
     */
    private function hasDecorativeAssets(Collection $assets): bool
    {
        foreach ($assets as $asset) {
            $role = is_string($asset->pivot?->role) ? trim((string) $asset->pivot->role) : null;

            if (PageBackgroundAssets::isDecorativeCanvasAsset($asset, $role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, string>  $roles
     * @return array<int, VisualAuditIssue>
     */
    private function checkDuplicateRoles(ThemeVersion $themeVersion, array $roles, string $label): array
    {
        $issues = [];
        $singleRoles = [
            ThemeAssetRoles::PAPER_TEXTURE,
            ThemeAssetRoles::BACKGROUND_TEXTURE,
            ThemeAssetRoles::BOOK_TEXTURE,
            ThemeAssetRoles::SPINE_TEXTURE,
            ThemeAssetRoles::FABRIC_BACKGROUND,
            ThemeAssetRoles::KRAFT_SURFACE,
            ThemeAssetRoles::PAGE_BACKGROUND,
        ];

        foreach (array_count_values($roles) as $role => $count) {
            if ($count <= 1 || ! in_array($role, $singleRoles, true)) {
                continue;
            }

            $issues[] = VisualAuditIssue::make(
                'warning',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema com role duplicada problemática',
                "A ThemeVersion {$label} possui {$count} assets com role {$role}.",
                'Use uma textura principal por role material para evitar resultado visual imprevisível.',
            );
        }

        return $issues;
    }

    /**
     * @param  array<string, mixed>|mixed  $config
     * @return array<int, VisualAuditIssue>
     */
    private function checkConfig(ThemeVersion $themeVersion, mixed $config, string $label): array
    {
        $issues = [];

        if (! is_array($config) || ($config['schemaVersion'] ?? null) !== 1) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema com config inválido',
                "A ThemeVersion {$label} não declara config.schemaVersion = 1.",
                'Normalize o config do tema antes de usar em templates reais.',
            );

            return $issues;
        }

        if (! is_array($config['book'] ?? null)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema sem config.book',
                "A ThemeVersion {$label} não possui config.book.",
                'Adicione book.mode, lombada, textura/superfície e transição permitida.',
            );
        }

        if (! $this->hasBasicTokens($config)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema sem tokens básicos',
                "A ThemeVersion {$label} não possui tokens básicos de cor/fonte.",
                'Garanta tokens.colors.paper, ink, accent e tokens.fonts heading/body/handwritten.',
            );
        }

        if ($this->configContainsUnsafeValue($config)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'theme',
                'ThemeVersion',
                $themeVersion->id,
                'Tema com config inválido',
                "A ThemeVersion {$label} contém URL, src ou storage_path no config.",
                'Config de tema deve referenciar somente assetRole/assetId seguro, nunca URLs manuais.',
            );
        }

        $references = ThemeConfig::textureAssetReferences($config);
        $associatedAssetIds = $themeVersion->assets->pluck('id')->map(fn (mixed $id): string => (string) $id)->all();

        foreach ($references['assetIds'] as $assetId) {
            if (! in_array($assetId, $associatedAssetIds, true)) {
                $issues[] = VisualAuditIssue::make(
                    'error',
                    'theme',
                    'ThemeVersion',
                    $themeVersion->id,
                    'Tema referencia asset fora do vínculo',
                    "A ThemeVersion {$label} referencia assetId {$assetId} no config, mas ele não está associado ao tema.",
                    'Associe o asset ao tema ou remova a referência direta do config.',
                );
            }
        }

        return $issues;
    }

    /**
     * @param  array<string, mixed>  $config
     */
    private function hasBasicTokens(array $config): bool
    {
        foreach ([
            'tokens.colors.paper',
            'tokens.colors.ink',
            'tokens.colors.accent',
            'tokens.fonts.heading',
            'tokens.fonts.body',
            'tokens.fonts.handwritten',
        ] as $key) {
            if (! filled(data_get($config, $key))) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private function configContainsUnsafeValue(array $value): bool
    {
        foreach ($value as $childKey => $child) {
            $normalizedKey = strtolower((string) $childKey);

            if (is_array($child)) {
                if ($this->configContainsUnsafeValue($child)) {
                    return true;
                }

                continue;
            }

            if (! is_string($child) || trim($child) === '') {
                continue;
            }

            if (in_array($normalizedKey, ['url', 'src', 'storage_path', 'storagepath', 'previewurl', 'preview_url'], true)) {
                return true;
            }

            if (preg_match('/(?:https?:)?\/\/[^\s]+/i', $child) === 1
                || preg_match('/^\s*(?:javascript|data|vbscript):/i', $child) === 1
            ) {
                return true;
            }
        }

        return false;
    }

    private function themeVersionLabel(ThemeVersion $themeVersion): string
    {
        $themeName = $themeVersion->theme?->name;

        return trim((string) ($themeName ?: $themeVersion->name ?: $themeVersion->id));
    }
}
