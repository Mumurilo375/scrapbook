<?php

namespace App\Domain\VisualQuality;

use App\Domain\Assets\Models\Asset;
use App\Domain\Assets\Support\PageBackgroundAssets;
use App\Domain\Templates\Models\TemplatePage;
use Illuminate\Support\Collection;
use Throwable;

final class CanvasQualityChecker
{
    private const MAX_ELEMENT_COORDINATE = 10000;

    private const MAX_ELEMENT_SIZE = 10000;

    private const MAX_ELEMENT_ROTATION = 3600;

    private const MAX_ELEMENT_Z = 100000;

    /**
     * @param  Collection<string, Asset>  $assetsById
     * @param  array<string, array<int, string>>  $rolesByAssetId
     * @return array<int, VisualAuditIssue>
     */
    public function checkTemplatePage(TemplatePage $page, Collection $assetsById, array $rolesByAssetId = []): array
    {
        $canvas = $page->canvas;
        $issues = [];

        if (! is_array($canvas)) {
            return [
                $this->issue(
                    $page,
                    'error',
                    'TemplatePage com canvas inseguro',
                    "A TemplatePage {$page->name} não possui canvas em formato JSON válido.",
                    'Recrie ou normalize o canvas antes de publicar a versão.',
                ),
            ];
        }

        $this->inspectValue($canvas, $page, $issues);

        if (($canvas['schemaVersion'] ?? null) !== 1) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com canvas inseguro',
                "A TemplatePage {$page->name} não declara schemaVersion 1.",
                'Use o contrato atual do canvas antes de produzir o template.',
            );
        }

        $artboard = $canvas['artboard'] ?? null;
        $artboardWidth = null;
        $artboardHeight = null;

        if (! is_array($artboard)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage sem artboard',
                "A TemplatePage {$page->name} não possui canvas.artboard.",
                'Adicione artboard com width, height, unit px, background e safeArea.',
            );
        } else {
            [$artboardWidth, $artboardHeight] = $this->checkArtboard($page, $artboard, $issues, $assetsById, $rolesByAssetId);
        }

        $elements = $canvas['elements'] ?? null;

        if (! is_array($elements)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com canvas inseguro',
                "A TemplatePage {$page->name} não possui elements como array.",
                'Garanta que canvas.elements seja uma lista, mesmo quando vazia.',
            );

            return $issues;
        }

        foreach ($elements as $index => $element) {
            if (! is_array($element)) {
                $issues[] = $this->issue(
                    $page,
                    'error',
                    'Elemento inválido no canvas',
                    "A TemplatePage {$page->name} possui elemento não-objeto na posição {$index}.",
                    'Remova valores soltos de canvas.elements.',
                );

                continue;
            }

            $this->checkElement($page, $index, $element, $issues, $assetsById, $rolesByAssetId, $artboardWidth, $artboardHeight);
        }

        return $issues;
    }

    /**
     * @param  array<string, mixed>  $artboard
     * @param  array<int, VisualAuditIssue>  $issues
     * @param  Collection<string, Asset>  $assetsById
     * @param  array<string, array<int, string>>  $rolesByAssetId
     * @return array{0: float|null, 1: float|null}
     */
    private function checkArtboard(
        TemplatePage $page,
        array $artboard,
        array &$issues,
        Collection $assetsById,
        array $rolesByAssetId,
    ): array {
        $width = $this->finiteNumber($artboard['width'] ?? null);
        $height = $this->finiteNumber($artboard['height'] ?? null);

        if ($width === null || $height === null || $width <= 0 || $height <= 0) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com artboard inválido',
                "A TemplatePage {$page->name} possui width/height de artboard inválidos.",
                'Use dimensões positivas, como 1080x1350.',
            );
        }

        if (($artboard['unit'] ?? 'px') !== 'px') {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com artboard inválido',
                "A TemplatePage {$page->name} usa artboard.unit diferente de px.",
                'Use unit px para manter o renderer consistente.',
            );
        }

        $background = $artboard['background'] ?? null;

        if (! is_array($background)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com paper/background inválido',
                "A TemplatePage {$page->name} não possui artboard.background válido.",
                'Use background type theme ou asset com assetId seguro.',
            );

            return [$width, $height];
        }

        if (($background['type'] ?? null) === 'theme') {
            return [$width, $height];
        }

        if (($background['type'] ?? null) !== 'asset') {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com paper/background inválido',
                "A TemplatePage {$page->name} usa background.type inválido.",
                'Use background type theme ou asset.',
            );

            return [$width, $height];
        }

        $assetId = $this->assetIdFrom($background);

        if ($assetId === null) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com background asset inválido',
                "A TemplatePage {$page->name} usa background asset sem assetId.",
                'Escolha um asset ativo de papel/fundo ou volte para papel do tema.',
            );

            return [$width, $height];
        }

        $asset = $assetsById->get($assetId);

        if (! $asset instanceof Asset) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com assetId inexistente',
                "A TemplatePage {$page->name} referencia background assetId {$assetId}, mas o asset não existe.",
                'Troque o papel da página por um asset existente ou use papel do tema.',
            );

            return [$width, $height];
        }

        $role = $this->firstRole($rolesByAssetId[$assetId] ?? []);

        if (! $asset->is_active || ! $this->safeIsPageBackground($asset, $role)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com background asset inválido',
                "A TemplatePage {$page->name} usa asset {$asset->name} como fundo, mas ele não é papel/fundo ativo.",
                'Use asset do tipo paper/texture ou role paper_texture/kraft_surface/page_background.',
            );
        }

        return [$width, $height];
    }

    /**
     * @param  array<string, mixed>  $element
     * @param  array<int, VisualAuditIssue>  $issues
     * @param  Collection<string, Asset>  $assetsById
     * @param  array<string, array<int, string>>  $rolesByAssetId
     */
    private function checkElement(
        TemplatePage $page,
        int $index,
        array $element,
        array &$issues,
        Collection $assetsById,
        array $rolesByAssetId,
        ?float $artboardWidth,
        ?float $artboardHeight,
    ): void {
        $elementLabel = "elemento {$index}";

        if (! is_string($element['id'] ?? null) || trim((string) $element['id']) === '') {
            $issues[] = $this->issue(
                $page,
                'error',
                'Elemento sem id',
                "A TemplatePage {$page->name} possui {$elementLabel} sem id.",
                'Defina ids estáveis para todos os elementos do canvas.',
            );
        }

        $type = is_string($element['type'] ?? null) ? trim((string) $element['type']) : '';

        if ($type === '') {
            $issues[] = $this->issue(
                $page,
                'error',
                'Elemento sem type',
                "A TemplatePage {$page->name} possui {$elementLabel} sem type.",
                'Defina type para cada elemento antes de publicar o template.',
            );
        }

        $numbers = [
            'x' => [-self::MAX_ELEMENT_COORDINATE, self::MAX_ELEMENT_COORDINATE],
            'y' => [-self::MAX_ELEMENT_COORDINATE, self::MAX_ELEMENT_COORDINATE],
            'w' => [1, self::MAX_ELEMENT_SIZE],
            'h' => [1, self::MAX_ELEMENT_SIZE],
            'z' => [-self::MAX_ELEMENT_Z, self::MAX_ELEMENT_Z],
            'rotation' => [-self::MAX_ELEMENT_ROTATION, self::MAX_ELEMENT_ROTATION],
        ];

        $resolvedNumbers = [];

        foreach ($numbers as $field => [$min, $max]) {
            $number = $this->finiteNumber($element[$field] ?? null);
            $resolvedNumbers[$field] = $number;

            if ($number === null || $number < $min || $number > $max) {
                $issues[] = $this->issue(
                    $page,
                    'error',
                    "Elemento com {$field} inválido",
                    "A TemplatePage {$page->name} possui {$elementLabel} com {$field} inválido.",
                    'Use números finitos e seguros para x/y/w/h/z/rotation.',
                );
            }
        }

        foreach (['locked', 'hidden'] as $field) {
            if (array_key_exists($field, $element) && ! is_bool($element[$field])) {
                $issues[] = $this->issue(
                    $page,
                    'error',
                    "Elemento com {$field} inválido",
                    "A TemplatePage {$page->name} possui {$elementLabel} com {$field} não booleano.",
                    'Use true/false para estados de camada.',
                );
            }
        }

        $this->checkAbsurdBounds($page, $index, $resolvedNumbers, $issues, $artboardWidth, $artboardHeight);
        $this->checkElementAsset($page, $index, $type, $element, $issues, $assetsById, $rolesByAssetId);
    }

    /**
     * @param  array<string, float|null>  $numbers
     * @param  array<int, VisualAuditIssue>  $issues
     */
    private function checkAbsurdBounds(
        TemplatePage $page,
        int $index,
        array $numbers,
        array &$issues,
        ?float $artboardWidth,
        ?float $artboardHeight,
    ): void {
        if ($artboardWidth === null || $artboardHeight === null || $artboardWidth <= 0 || $artboardHeight <= 0) {
            return;
        }

        foreach (['x', 'y', 'w', 'h'] as $field) {
            if ($numbers[$field] === null) {
                return;
            }
        }

        $x = $numbers['x'];
        $y = $numbers['y'];
        $w = $numbers['w'];
        $h = $numbers['h'];

        if ($x + $w < -$artboardWidth
            || $x > $artboardWidth * 2
            || $y + $h < -$artboardHeight
            || $y > $artboardHeight * 2
            || $w > $artboardWidth * 3
            || $h > $artboardHeight * 3
        ) {
            $issues[] = $this->issue(
                $page,
                'warning',
                'Elemento fora de limites absurdos',
                "A TemplatePage {$page->name} possui elemento {$index} muito fora do artboard.",
                'Reposicione ou reduza o elemento antes de revisar em celular real.',
            );
        }
    }

    /**
     * @param  array<string, mixed>  $element
     * @param  array<int, VisualAuditIssue>  $issues
     * @param  Collection<string, Asset>  $assetsById
     * @param  array<string, array<int, string>>  $rolesByAssetId
     */
    private function checkElementAsset(
        TemplatePage $page,
        int $index,
        string $type,
        array $element,
        array &$issues,
        Collection $assetsById,
        array $rolesByAssetId,
    ): void {
        $assetId = $this->assetIdFrom($element);

        if ($assetId === null) {
            return;
        }

        $asset = $assetsById->get($assetId);

        if (! $asset instanceof Asset) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com assetId inexistente',
                "A TemplatePage {$page->name} referencia assetId {$assetId} no elemento {$index}, mas ele não existe.",
                'Substitua por asset ativo do sistema ou remova a referência.',
            );

            return;
        }

        if (! $asset->is_active) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage usa asset inativo',
                "A TemplatePage {$page->name} referencia o asset inativo {$asset->name}.",
                'Use apenas assets ativos em templates publicados.',
            );
        }

        $role = $this->firstRole($rolesByAssetId[$assetId] ?? []);

        if ($type === 'sticker' && $this->safeIsPageBackground($asset, $role)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'Papel usado como sticker',
                "A TemplatePage {$page->name} usa o papel/textura {$asset->name} como sticker.",
                'Papel deve ficar em canvas.artboard.background, não em canvas.elements.',
            );
        }
    }

    /**
     * @param  array<string, mixed>  $value
     * @param  array<int, VisualAuditIssue>  $issues
     */
    private function inspectValue(mixed $value, TemplatePage $page, array &$issues, string $path = 'canvas'): void
    {
        if (is_array($value)) {
            foreach ($value as $key => $child) {
                $this->inspectValue($child, $page, $issues, $path.'.'.(string) $key);
            }

            return;
        }

        $key = strtolower((string) str($path)->afterLast('.'));

        if (in_array($key, ['mediaitemid', 'media_item_id', 'mediaid', 'media_id'], true) && filled($value)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com mediaItemId em template',
                "A TemplatePage {$page->name} salva mídia pessoal em {$path}.",
                'Templates devem usar placeholders de imagem, nunca MediaItem de um Gift.',
            );
        }

        if (! is_string($value) || trim($value) === '') {
            return;
        }

        $trimmed = trim($value);

        if (preg_match('/(?:https?:)?\/\/[^\s]+/i', $trimmed) === 1) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com URL externa',
                "A TemplatePage {$page->name} contém URL externa em {$path}.",
                'Remova URLs do canvas e deixe o backend resolver assets/mídias por id seguro.',
            );
        }

        if (preg_match('/^\s*(?:javascript|data|vbscript):/i', $trimmed) === 1) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com URL externa',
                "A TemplatePage {$page->name} contém protocolo inseguro em {$path}.",
                'Remova protocolos manuais do canvas.',
            );
        }

        if (in_array($key, ['src', 'url', 'href', 'previewurl', 'preview_url', 'publicurl', 'public_url', 'asseturl', 'asset_url', 'storage_path', 'storagepath'], true)) {
            $issues[] = $this->issue(
                $page,
                'error',
                'Canvas contém URL/path manual',
                "A TemplatePage {$page->name} salva {$key} em {$path}.",
                'Canvas de template deve guardar assetId/media placeholder, nunca src, previewUrl ou storage_path.',
            );
        }

        if ($key === 'html'
            || $key === 'innerhtml'
            || preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $trimmed) === 1
        ) {
            $issues[] = $this->issue(
                $page,
                'error',
                'TemplatePage com texto contendo HTML/script',
                "A TemplatePage {$page->name} contém HTML/script em {$path}.",
                'Use texto puro no canvas.',
            );
        }
    }

    /**
     * @param  array<string, mixed>  $value
     */
    private function assetIdFrom(array $value): ?string
    {
        $assetId = $value['assetId'] ?? $value['asset_id'] ?? null;

        if (! is_string($assetId) && ! is_int($assetId)) {
            return null;
        }

        $assetId = trim((string) $assetId);

        return $assetId === '' ? null : $assetId;
    }

    /**
     * @param  array<int, string>  $roles
     */
    private function firstRole(array $roles): ?string
    {
        foreach ($roles as $role) {
            if (is_string($role) && trim($role) !== '') {
                return trim($role);
            }
        }

        return null;
    }

    private function safeIsPageBackground(Asset $asset, ?string $role = null): bool
    {
        try {
            return PageBackgroundAssets::isPageBackground($asset, $role);
        } catch (Throwable) {
            return false;
        }
    }

    private function finiteNumber(mixed $value): ?float
    {
        if (! is_int($value) && ! is_float($value) && ! (is_string($value) && is_numeric($value))) {
            return null;
        }

        $number = (float) $value;

        return is_finite($number) ? $number : null;
    }

    private function issue(TemplatePage $page, string $severity, string $title, string $message, string $hint): VisualAuditIssue
    {
        return VisualAuditIssue::make(
            $severity,
            'canvas',
            'TemplatePage',
            $page->id,
            $title,
            $message,
            $hint,
        );
    }
}
