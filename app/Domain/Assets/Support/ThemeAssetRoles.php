<?php

namespace App\Domain\Assets\Support;

final class ThemeAssetRoles
{
    public const STICKER = 'sticker';

    public const PAPER_TEXTURE = 'paper_texture';

    public const BACKGROUND_TEXTURE = 'background_texture';

    public const BOOK_TEXTURE = 'book_texture';

    public const SPINE_TEXTURE = 'spine_texture';

    public const PAGE_OVERLAY = 'page_overlay';

    public const EDGE_OVERLAY = 'edge_overlay';

    public const FABRIC_BACKGROUND = 'fabric_background';

    public const KRAFT_SURFACE = 'kraft_surface';

    public const AGING_OVERLAY = 'aging_overlay';

    public const STAIN_OVERLAY = 'stain_overlay';

    public const TAPE = 'tape';

    public const FRAME = 'frame';

    public const DECORATION = 'decoration';

    public const OVERLAY = 'overlay';

    public const BORDER = 'border';

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return [
            self::STICKER => 'Sticker',
            self::PAPER_TEXTURE => 'Textura de papel',
            self::BACKGROUND_TEXTURE => 'Textura de fundo externo',
            self::BOOK_TEXTURE => 'Textura de livro/capa',
            self::SPINE_TEXTURE => 'Textura de lombada',
            self::PAGE_OVERLAY => 'Overlay de página',
            self::EDGE_OVERLAY => 'Overlay de borda',
            self::FABRIC_BACKGROUND => 'Fundo de tecido/mesa',
            self::KRAFT_SURFACE => 'Superfície kraft',
            self::AGING_OVERLAY => 'Overlay envelhecido',
            self::STAIN_OVERLAY => 'Manchas leves',
            self::TAPE => 'Fita',
            self::FRAME => 'Moldura',
            self::DECORATION => 'Decoração',
            self::OVERLAY => 'Overlay',
            self::BORDER => 'Borda',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function textureRoles(): array
    {
        return [
            self::PAPER_TEXTURE,
            self::BACKGROUND_TEXTURE,
            self::BOOK_TEXTURE,
            self::SPINE_TEXTURE,
            self::PAGE_OVERLAY,
            self::EDGE_OVERLAY,
            self::FABRIC_BACKGROUND,
            self::KRAFT_SURFACE,
            self::AGING_OVERLAY,
            self::STAIN_OVERLAY,
            self::OVERLAY,
            self::BORDER,
        ];
    }

    public static function isKnown(string $role): bool
    {
        return array_key_exists($role, self::options());
    }

    public static function isTextureRole(string $role): bool
    {
        return in_array($role, self::textureRoles(), true);
    }
}
