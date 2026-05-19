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

    public const PAGE_BACKGROUND = 'page_background';

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
            self::STICKER => 'Adesivo/decorativo do tema',
            self::PAPER_TEXTURE => 'Textura de papel',
            self::BACKGROUND_TEXTURE => 'Textura de fundo externo',
            self::BOOK_TEXTURE => 'Textura de livro/capa',
            self::SPINE_TEXTURE => 'Textura de lombada',
            self::PAGE_OVERLAY => 'Overlay de página',
            self::EDGE_OVERLAY => 'Overlay de borda',
            self::FABRIC_BACKGROUND => 'Fundo de tecido/mesa',
            self::KRAFT_SURFACE => 'Superfície kraft',
            self::PAGE_BACKGROUND => 'Papel/fundo de página',
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
     * @return array<string, string>
     */
    public static function descriptions(): array
    {
        return [
            self::STICKER => 'Aparece primeiro na aba Adesivos do editor quando o Gift usa este tema.',
            self::PAPER_TEXTURE => 'Troca a textura da folha/página no editor, preview e viewer.',
            self::BACKGROUND_TEXTURE => 'Troca o fundo externo atrás do scrapbook.',
            self::BOOK_TEXTURE => 'Troca a superfície/capa do livro aberto.',
            self::SPINE_TEXTURE => 'Troca a textura da lombada central do Book Mode.',
            self::PAGE_OVERLAY => 'Camada visual sobre a página, útil para fibras ou desgaste leve.',
            self::EDGE_OVERLAY => 'Camada de borda/desgaste da folha.',
            self::FABRIC_BACKGROUND => 'Fundo de mesa/tecido atrás do livro.',
            self::KRAFT_SURFACE => 'Textura alternativa para papel kraft.',
            self::PAGE_BACKGROUND => 'Papel selecionável para preencher a folha inteira, sem virar adesivo.',
            self::AGING_OVERLAY => 'Envelhecimento, manchas e marcas antigas sutis.',
            self::STAIN_OVERLAY => 'Manchas leves sobre a página.',
            self::TAPE => 'Fita decorativa adicionável como adesivo.',
            self::FRAME => 'Moldura decorativa adicionável como adesivo.',
            self::DECORATION => 'Decoração solta do tema, como flores, recortes e rabiscos.',
            self::OVERLAY => 'Overlay visual reutilizável.',
            self::BORDER => 'Borda decorativa reutilizável.',
        ];
    }

    public static function label(string $role): string
    {
        return self::options()[$role] ?? str($role)->replace('_', ' ')->headline()->toString();
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
            self::PAGE_BACKGROUND,
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
