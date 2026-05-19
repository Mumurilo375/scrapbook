<?php

namespace App\Domain\VisualQuality;

use App\Domain\Assets\Models\Asset;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplatePage;
use App\Domain\Templates\Models\TemplateVersion;
use Illuminate\Support\Collection;

final class TemplateQualityChecker
{
    public function __construct(private readonly CanvasQualityChecker $canvasQualityChecker) {}

    /**
     * @return array<int, VisualAuditIssue>
     */
    public function check(): array
    {
        $issues = [];
        $assetsById = Asset::query()->get()->keyBy('id');

        array_push($issues, ...$this->checkTemplates());
        array_push($issues, ...$this->checkPublishedVersions($assetsById));

        return $issues;
    }

    /**
     * @return array<int, VisualAuditIssue>
     */
    private function checkTemplates(): array
    {
        $issues = [];

        Template::query()
            ->with('versions')
            ->orderBy('name')
            ->get()
            ->each(function (Template $template) use (&$issues): void {
                $hasPublishedVersion = $template->versions
                    ->contains(fn (TemplateVersion $version): bool => $version->getRawOriginal('status') === TemplateVersionStatus::Published->value);

                if ($template->is_active && ! $hasPublishedVersion) {
                    $issues[] = VisualAuditIssue::make(
                        'error',
                        'template',
                        'Template',
                        $template->id,
                        'Template publicado sem versão publicada',
                        "O template {$template->name} está ativo, mas não possui TemplateVersion publicada.",
                        'Publique uma versão revisada ou desative o template até ele estar pronto.',
                    );
                }

                if (! $template->is_active && ! $hasPublishedVersion) {
                    $issues[] = VisualAuditIssue::make(
                        'info',
                        'template',
                        'Template',
                        $template->id,
                        'Template draft ainda não publicado',
                        "O template {$template->name} ainda não tem versão publicada.",
                        'Sem ação necessária se ele ainda estiver em produção.',
                    );
                }
            });

        return $issues;
    }

    /**
     * @param  Collection<string, Asset>  $assetsById
     * @return array<int, VisualAuditIssue>
     */
    private function checkPublishedVersions(Collection $assetsById): array
    {
        $issues = [];

        TemplateVersion::query()
            ->with(['template', 'pages', 'themeVersion.assets'])
            ->where('status', TemplateVersionStatus::Published->value)
            ->orderBy('name')
            ->get()
            ->each(function (TemplateVersion $version) use (&$issues, $assetsById): void {
                array_push($issues, ...$this->checkPublishedVersion($version, $assetsById));
            });

        return $issues;
    }

    /**
     * @param  Collection<string, Asset>  $assetsById
     * @return array<int, VisualAuditIssue>
     */
    private function checkPublishedVersion(TemplateVersion $version, Collection $assetsById): array
    {
        $issues = [];
        $label = $this->versionLabel($version);

        if ($version->pages->isEmpty()) {
            return [
                VisualAuditIssue::make(
                    'error',
                    'template',
                    'TemplateVersion',
                    $version->id,
                    'TemplateVersion publicada sem páginas',
                    "A TemplateVersion {$label} está publicada, mas não possui páginas.",
                    'Crie ao menos uma TemplatePage com artboard válido antes de publicar.',
                ),
            ];
        }

        $rolesByAssetId = $this->rolesByAssetId($version);

        foreach ($version->pages as $page) {
            array_push($issues, ...$this->canvasQualityChecker->checkTemplatePage($page, $assetsById, $rolesByAssetId));
        }

        if (! $this->versionHasImagePlaceholders($version)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'template',
                'TemplateVersion',
                $version->id,
                'Template sem placeholders de imagem',
                "A TemplateVersion {$label} não possui elementos de imagem ou polaroid para o cliente preencher.",
                'Confirme se este template é realmente só textual; se for visual, adicione placeholders de foto.',
            );
        }

        return $issues;
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function rolesByAssetId(TemplateVersion $version): array
    {
        $roles = [];
        $assets = $version->themeVersion?->assets ?? collect();

        foreach ($assets as $asset) {
            $assetId = (string) $asset->id;
            $role = $asset->pivot?->role;

            if (! is_string($role) || trim($role) === '') {
                continue;
            }

            $roles[$assetId] ??= [];
            $roles[$assetId][] = trim($role);
        }

        return $roles;
    }

    private function versionHasImagePlaceholders(TemplateVersion $version): bool
    {
        foreach ($version->pages as $page) {
            foreach ($this->elements($page) as $element) {
                if (! is_array($element)) {
                    continue;
                }

                if (($element['type'] ?? null) === 'image' || ($element['type'] ?? null) === 'flip_polaroid') {
                    return true;
                }

                if (filled($element['placeholderLabel'] ?? null)
                    || filled(data_get($element, 'front.placeholderLabel'))
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @return array<int, mixed>
     */
    private function elements(TemplatePage $page): array
    {
        $canvas = is_array($page->canvas) ? $page->canvas : [];
        $elements = $canvas['elements'] ?? [];

        return is_array($elements) ? $elements : [];
    }

    private function versionLabel(TemplateVersion $version): string
    {
        $templateName = $version->template?->name;

        return trim((string) ($templateName ?: $version->name ?: $version->id));
    }
}
