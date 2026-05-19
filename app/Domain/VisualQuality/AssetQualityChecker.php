<?php

namespace App\Domain\VisualQuality;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Models\AssetCategory;
use App\Domain\Assets\Services\AssetUrlResolver;
use Illuminate\Support\Facades\DB;

final class AssetQualityChecker
{
    public function __construct(private readonly AssetUrlResolver $assetUrlResolver) {}

    /**
     * @return array<int, VisualAuditIssue>
     */
    public function check(): array
    {
        $issues = [];

        $assets = Asset::query()
            ->with(['category', 'themeVersions'])
            ->orderBy('name')
            ->get();

        foreach ($assets as $asset) {
            array_push($issues, ...$this->checkAsset($asset));
        }

        array_push($issues, ...$this->checkCategories());

        return $issues;
    }

    /**
     * @return array<int, VisualAuditIssue>
     */
    private function checkAsset(Asset $asset): array
    {
        $issues = [];
        $rawType = $this->rawType($asset);
        $metadata = is_array($asset->metadata) ? $asset->metadata : [];
        $label = $this->assetLabel($asset);

        if (! $this->isKnownType($rawType)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset com tipo indefinido',
                "O asset {$label} usa tipo vazio ou não suportado: {$rawType}.",
                'Escolha um tipo válido no admin antes de usar o asset em temas ou templates.',
            );
        }

        if ($asset->asset_category_id === null) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem categoria',
                "O asset {$label} não possui categoria.",
                'Associe o asset a uma categoria clara para facilitar a produção de templates.',
            );
        }

        if (! $asset->is_active && $asset->themeVersions->isNotEmpty()) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset inativo associado a tema',
                "O asset {$label} está inativo, mas ainda aparece em um ou mais temas.",
                'Remova o vínculo de tema ou reative/substitua o asset antes do QA manual.',
            );
        }

        if (! filled($asset->storage_path) && ! filled($asset->public_url)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem arquivo',
                "O asset {$label} não possui storage_path nem public_url seguro.",
                'Reenvie o arquivo pelo admin para preencher o path interno com segurança.',
            );
        } elseif (! filled($asset->storage_path)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem storage_path',
                "O asset {$label} depende de public_url, mas não possui storage_path interno.",
                'Prefira assets processados pelo upload administrativo, com storage_path preenchido.',
            );
        }

        if (! filled($asset->storage_disk)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem disk de storage',
                "O asset {$label} não declara storage_disk.",
                'Reprocesse o asset pelo admin para gravar storage_disk e storage_path.',
            );
        }

        if ($this->hasExternalPublicUrl($asset)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset com public_url externo',
                "O asset {$label} possui public_url externo.",
                'Use somente previews gerados por rota segura da aplicação.',
            );
        }

        if (! $this->hasValidPreviewUrl($asset)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem previewUrl válido',
                "O asset {$label} não gera previewUrl seguro.",
                'Confirme storage_path/storage_disk ou remova public_url manual externo.',
            );
        }

        if (! is_numeric($asset->width) || ! is_numeric($asset->height) || $asset->width <= 0 || $asset->height <= 0) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem width/height',
                "O asset {$label} não possui dimensões válidas.",
                'Reprocesse o upload para preencher width e height.',
            );
        } else {
            array_push($issues, ...$this->checkDimensions($asset, $rawType, $label));
        }

        if (! is_numeric($asset->size_bytes) || $asset->size_bytes <= 0) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem size_bytes',
                "O asset {$label} não possui tamanho de arquivo válido.",
                'Reprocesse o upload para preencher size_bytes.',
            );
        } elseif ($asset->size_bytes > ((int) config('scrapbook.assets.max_upload_kb', 8192) * 1024)) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset grande demais',
                "O asset {$label} possui ".number_format((float) $asset->size_bytes / 1024 / 1024, 2, ',', '.').' MB.',
                'Otimize o arquivo antes de testar em celular real.',
            );
        }

        if ($this->isStickerType($rawType) && ! is_array(data_get($metadata, 'physical'))) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Sticker sem metadata physical',
                "O asset {$label} é sticker/decorativo e não possui metadata.physical.",
                'Preencha physical para borda, sombra, lift e textura física coerentes.',
            );
        }

        if (! filled(data_get($metadata, 'renderStyle'))) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset sem renderStyle',
                "O asset {$label} não possui metadata.renderStyle.",
                'Defina renderStyle para o renderer físico cair no estilo correto.',
            );
        }

        if ($this->looksLikeSvg($asset)) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset',
                'Asset',
                $asset->id,
                'Asset SVG bloqueado',
                "O asset {$label} parece SVG, formato que continua bloqueado nesta etapa.",
                'Substitua por PNG, WebP ou JPG/JPEG processado pelo admin.',
            );
        }

        return $issues;
    }

    /**
     * @return array<int, VisualAuditIssue>
     */
    private function checkCategories(): array
    {
        $issues = [];

        AssetCategory::query()
            ->withCount([
                'assets',
                'assets as active_assets_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('name')
            ->get()
            ->each(function (AssetCategory $category) use (&$issues): void {
                if ($category->assets_count === 0) {
                    $issues[] = VisualAuditIssue::make(
                        'info',
                        'asset_category',
                        'AssetCategory',
                        $category->id,
                        'Categoria sem assets',
                        "A categoria {$category->name} ainda não possui assets.",
                        'Mantenha apenas se ela for parte do roteiro de produção visual.',
                    );
                }

                if (! $category->is_active && $category->active_assets_count > 0) {
                    $issues[] = VisualAuditIssue::make(
                        'warning',
                        'asset_category',
                        'AssetCategory',
                        $category->id,
                        'Categoria inativa com assets ativos',
                        "A categoria {$category->name} está inativa e contém assets ativos.",
                        'Reative a categoria ou mova/desative os assets antes do QA manual.',
                    );
                }
            });

        $duplicateSlugs = DB::table('asset_categories')
            ->select('slug')
            ->whereNotNull('slug')
            ->groupBy('slug')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('slug');

        foreach ($duplicateSlugs as $slug) {
            $issues[] = VisualAuditIssue::make(
                'error',
                'asset_category',
                'AssetCategory',
                null,
                'Categorias duplicadas por slug',
                "Mais de uma categoria usa o slug {$slug}.",
                'Mantenha slugs únicos para filtros e URLs administrativas previsíveis.',
            );
        }

        return $issues;
    }

    /**
     * @return array<int, VisualAuditIssue>
     */
    private function checkDimensions(Asset $asset, string $rawType, string $label): array
    {
        $issues = [];
        $width = (int) $asset->width;
        $height = (int) $asset->height;
        $longest = max($width, $height);
        $shortest = min($width, $height);

        if ($longest < 128) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset muito pequeno',
                "O asset {$label} tem apenas {$width}x{$height}px.",
                'Troque por arquivo maior para evitar pixelização no canvas.',
            );
        }

        if ($width > (int) config('scrapbook.assets.max_input_width', 6000)
            || $height > (int) config('scrapbook.assets.max_input_height', 6000)
        ) {
            $issues[] = VisualAuditIssue::make(
                'warning',
                'asset',
                'Asset',
                $asset->id,
                'Asset grande demais',
                "O asset {$label} tem {$width}x{$height}px.",
                'Reduza dimensões para evitar custo alto no editor e viewer mobile.',
            );
        }

        if ($this->isPaperType($rawType)) {
            if ($longest < 1080 || $shortest < 800) {
                $issues[] = VisualAuditIssue::make(
                    'warning',
                    'asset',
                    'Asset',
                    $asset->id,
                    'Papel pequeno demais',
                    "O papel/textura {$label} tem {$width}x{$height}px.",
                    'Use papéis próximos de 1080x1350 ou 2160x2700.',
                );
            }

            $ratio = $height > 0 ? $width / $height : 0;

            if ($ratio < 0.70 || $ratio > 0.90) {
                $issues[] = VisualAuditIssue::make(
                    'warning',
                    'asset',
                    'Asset',
                    $asset->id,
                    'Asset de papel com proporção ruim',
                    "O papel/textura {$label} tem proporção ".round($ratio, 2).', fora do alvo 4:5.',
                    'Use proporção próxima do artboard padrão 1080x1350.',
                );
            }
        }

        return $issues;
    }

    private function hasValidPreviewUrl(Asset $asset): bool
    {
        $previewUrl = $this->assetUrlResolver->previewUrl($asset);

        return is_string($previewUrl)
            && $previewUrl !== ''
            && str_starts_with($previewUrl, '/')
            && ! str_starts_with($previewUrl, '//');
    }

    private function hasExternalPublicUrl(Asset $asset): bool
    {
        $url = trim((string) $asset->public_url);

        return $url !== '' && ! str_starts_with($url, '/');
    }

    private function looksLikeSvg(Asset $asset): bool
    {
        $mimeType = strtolower(trim((string) $asset->mime_type));
        $storagePath = strtolower(trim((string) $asset->storage_path));
        $publicUrl = strtolower(trim((string) $asset->public_url));

        return $mimeType === 'image/svg+xml'
            || str_ends_with($storagePath, '.svg')
            || str_ends_with($publicUrl, '.svg');
    }

    private function rawType(Asset $asset): string
    {
        return trim((string) $asset->getRawOriginal('type'));
    }

    private function isKnownType(string $rawType): bool
    {
        return $rawType !== '' && in_array($rawType, $this->assetTypeValues(), true);
    }

    private function isStickerType(string $rawType): bool
    {
        return in_array($rawType, [
            AssetType::Sticker->value,
            AssetType::Cutout->value,
            AssetType::Flower->value,
            AssetType::Decoration->value,
            AssetType::Icon->value,
            AssetType::Shape->value,
            AssetType::Doodle->value,
        ], true);
    }

    private function isPaperType(string $rawType): bool
    {
        return in_array($rawType, [
            AssetType::Paper->value,
            AssetType::Texture->value,
            AssetType::Background->value,
            AssetType::Newspaper->value,
        ], true);
    }

    /**
     * @return array<int, string>
     */
    private function assetTypeValues(): array
    {
        return array_map(
            fn (AssetType $type): string => $type->value,
            AssetType::cases(),
        );
    }

    private function assetLabel(Asset $asset): string
    {
        return $asset->name !== '' ? $asset->name : (string) $asset->id;
    }
}
