<?php

namespace App\Domain\Gifts\Services;

use App\Domain\Editor\CanvasSecurity;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Domain\Media\Models\MediaItem;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class GiftPublicationChecklist
{
    public function __construct(private readonly CanvasSecurity $canvasSecurity) {}

    /**
     * @return array<int, array{key: string, label: string, passed: bool, severity: string, message?: string}>
     */
    public function evaluate(User $user, Gift $gift, bool $allowPublished = false, bool $allowPendingPayment = false): array
    {
        $gift->loadMissing(['pages', 'mediaItems', 'plan']);

        $visiblePages = $gift->pages
            ->filter(fn (GiftPage $page): bool => $page->is_visible)
            ->values();

        return [
            $this->check(
                'owner',
                'Presente pertence ao usuário',
                $gift->user_id === $user->id,
                'error',
                'Apenas o dono pode publicar este presente.',
            ),
            $this->check(
                'draft_status',
                'Status permite avançar',
                $gift->statusEnum() === GiftStatus::Draft
                    || ($allowPendingPayment && $gift->statusEnum() === GiftStatus::PendingPayment)
                    || ($allowPublished && $gift->statusEnum() === GiftStatus::Published),
                'error',
                'Somente gifts em rascunho podem iniciar checkout; gifts com pagamento pendente só publicam após aprovação.',
            ),
            $this->check(
                'not_disabled',
                'Presente não está desativado',
                $gift->statusEnum() !== GiftStatus::Disabled,
                'error',
                'Gifts desativados não podem ser publicados.',
            ),
            $this->check(
                'not_expired',
                'Presente não está expirado',
                $gift->statusEnum() !== GiftStatus::Expired && ($gift->expires_at === null || $gift->expires_at->isFuture()),
                'error',
                'Gifts expirados não podem ser publicados.',
            ),
            $this->check(
                'title',
                'Título preenchido',
                is_string($gift->title) && trim($gift->title) !== '',
                'error',
                'Preencha um título para o presente.',
            ),
            $this->check(
                'template_version',
                'Template de origem definido',
                is_string($gift->template_version_id) && $gift->template_version_id !== '',
                'error',
                'O gift precisa ter sido criado a partir de um template publicado.',
            ),
            $this->check(
                'theme_version',
                'Tema definido',
                is_string($gift->theme_version_id) && $gift->theme_version_id !== '',
                'error',
                'O gift precisa ter um tema definido.',
            ),
            $this->check(
                'visible_pages',
                'Pelo menos uma página visível',
                $visiblePages->isNotEmpty(),
                'error',
                'Deixe ao menos uma página visível antes de publicar.',
            ),
            $this->canvasCheck($visiblePages),
            $this->mediaReferencesCheck($gift, $visiblePages),
            $this->missingImagesCheck($visiblePages),
            $this->pageLimitCheck($gift, $visiblePages),
            $this->photoLimitCheck($gift),
        ];
    }

    /**
     * @param  array<int, array{key: string, label: string, passed: bool, severity: string, message?: string}>  $checks
     */
    public function canPublish(array $checks): bool
    {
        foreach ($checks as $check) {
            if (($check['severity'] ?? 'error') === 'error' && ! ($check['passed'] ?? false)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, array{key: string, label: string, passed: bool, severity: string, message?: string}>  $checks
     * @return array<string, string>
     */
    public function errorMessages(array $checks): array
    {
        $errors = [];

        foreach ($checks as $check) {
            if (($check['severity'] ?? 'error') !== 'error' || ($check['passed'] ?? false)) {
                continue;
            }

            $errors[$check['key']] = $check['message'] ?? $check['label'];
        }

        return $errors;
    }

    /**
     * @param  Collection<int, GiftPage>  $visiblePages
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function canvasCheck(Collection $visiblePages): array
    {
        foreach ($visiblePages as $page) {
            try {
                $canvas = is_array($page->canvas) ? $page->canvas : [];

                $this->canvasSecurity->validate(
                    $canvas,
                    $this->canvasSecurity->textMaxLengthForPage($page),
                );

                if (! $this->hasValidArtboard($canvas)) {
                    return $this->check(
                        'canvas',
                        'Canvas das páginas é válido',
                        false,
                        'error',
                        "A página {$page->name} precisa de artboard válido.",
                    );
                }
            } catch (ValidationException) {
                return $this->check(
                    'canvas',
                    'Canvas das páginas é válido',
                    false,
                    'error',
                    "Revise o canvas da página {$page->name}: não pode conter HTML, scripts, protocolos inseguros ou URLs externas.",
                );
            }
        }

        return $this->check(
            'canvas',
            'Canvas das páginas é válido',
            true,
            'error',
        );
    }

    /**
     * @param  Collection<int, GiftPage>  $visiblePages
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function mediaReferencesCheck(Gift $gift, Collection $visiblePages): array
    {
        $mediaItems = $gift->mediaItems
            ->keyBy('id');

        foreach ($visiblePages as $page) {
            foreach ($this->imageElements($page) as $element) {
                $mediaItemId = $element['mediaItemId'] ?? $element['media_item_id'] ?? null;
                $src = $element['src'] ?? null;

                if (($mediaItemId === null || $mediaItemId === '') && is_string($src) && trim($src) !== '') {
                    return $this->check(
                        'media_references',
                        'Imagens usam mídia segura do Gift',
                        false,
                        'error',
                        "A página {$page->name} tem imagem com src manual. Use uma imagem enviada para este gift.",
                    );
                }

                if ($mediaItemId === null || $mediaItemId === '') {
                    continue;
                }

                $mediaItem = $mediaItems->get(trim((string) $mediaItemId));

                if (! $mediaItem instanceof MediaItem || ! $this->mediaCanBePublished($gift, $mediaItem)) {
                    return $this->check(
                        'media_references',
                        'Imagens usam mídia segura do Gift',
                        false,
                        'error',
                        "A página {$page->name} referencia uma imagem indisponível ou de outro gift.",
                    );
                }
            }
        }

        return $this->check(
            'media_references',
            'Imagens usam mídia segura do Gift',
            true,
            'error',
        );
    }

    /**
     * @param  Collection<int, GiftPage>  $visiblePages
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function missingImagesCheck(Collection $visiblePages): array
    {
        foreach ($visiblePages as $page) {
            foreach ($this->imageElements($page) as $element) {
                $mediaItemId = $element['mediaItemId'] ?? $element['media_item_id'] ?? null;

                if ($mediaItemId === null || $mediaItemId === '') {
                    return $this->check(
                        'image_placeholders',
                        'Espaços de imagem preenchidos',
                        false,
                        'warning',
                        'Há espaços de imagem sem foto; o viewer exibirá placeholder seguro.',
                    );
                }
            }
        }

        return $this->check(
            'image_placeholders',
            'Espaços de imagem preenchidos',
            true,
            'warning',
        );
    }

    /**
     * @param  Collection<int, GiftPage>  $visiblePages
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function pageLimitCheck(Gift $gift, Collection $visiblePages): array
    {
        $maxPages = $this->limitValue($gift, 'max_pages');

        if ($maxPages === null) {
            return $this->check('page_limit', 'Limite de páginas respeitado', true, 'error');
        }

        return $this->check(
            'page_limit',
            'Limite de páginas respeitado',
            $visiblePages->count() <= $maxPages,
            'error',
            "Este gift tem {$visiblePages->count()} páginas visíveis, acima do limite de {$maxPages}.",
        );
    }

    /**
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function photoLimitCheck(Gift $gift): array
    {
        $maxPhotos = $this->limitValue($gift, 'max_photos');

        if ($maxPhotos === null) {
            return $this->check('photo_limit', 'Limite de fotos respeitado', true, 'error');
        }

        $processedPhotos = $gift->mediaItems
            ->filter(fn (MediaItem $mediaItem): bool => $this->mediaCanBePublished($gift, $mediaItem))
            ->count();

        return $this->check(
            'photo_limit',
            'Limite de fotos respeitado',
            $processedPhotos <= $maxPhotos,
            'error',
            "Este gift tem {$processedPhotos} fotos processadas, acima do limite de {$maxPhotos}.",
        );
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function imageElements(GiftPage $page): array
    {
        $canvas = is_array($page->canvas) ? $page->canvas : [];
        $elements = is_array($canvas['elements'] ?? null) ? $canvas['elements'] : [];

        return collect($elements)
            ->filter(fn (mixed $element): bool => is_array($element) && ($element['type'] ?? null) === 'image')
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $canvas
     */
    private function hasValidArtboard(array $canvas): bool
    {
        $artboard = $canvas['artboard'] ?? null;

        return is_array($artboard)
            && is_numeric($artboard['width'] ?? null)
            && is_numeric($artboard['height'] ?? null)
            && (float) $artboard['width'] > 0
            && (float) $artboard['height'] > 0;
    }

    private function mediaCanBePublished(Gift $gift, MediaItem $mediaItem): bool
    {
        return $mediaItem->gift_id === $gift->id
            && $mediaItem->deleted_at === null
            && $mediaItem->type === MediaType::Image
            && $mediaItem->status === MediaStatus::Processed;
    }

    private function limitValue(Gift $gift, string $key): ?int
    {
        $snapshotValue = data_get($gift->limits_snapshot, $key);

        if (is_numeric($snapshotValue)) {
            return max(0, (int) $snapshotValue);
        }

        $planValue = $gift->plan?->getAttribute($key);

        if (is_numeric($planValue)) {
            return max(0, (int) $planValue);
        }

        return null;
    }

    /**
     * @return array{key: string, label: string, passed: bool, severity: string, message?: string}
     */
    private function check(string $key, string $label, bool $passed, string $severity, ?string $message = null): array
    {
        $check = [
            'key' => $key,
            'label' => $label,
            'passed' => $passed,
            'severity' => $severity,
        ];

        if (! $passed && is_string($message) && $message !== '') {
            $check['message'] = Str::limit($message, 240, '');
        }

        return $check;
    }
}
