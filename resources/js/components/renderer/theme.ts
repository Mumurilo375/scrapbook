export type RendererContext = 'editor' | 'preview' | 'public';

export type ThemeConfigInput = Record<string, unknown> | null | undefined;

export type ThemeTextureLayerConfig = {
    assetRole?: string | null;
    assetId?: string | number | null;
    opacity: number;
    blendMode: string;
    size: string;
    position: string;
    repeat: string;
};

export type NormalizedThemeConfig = {
    tokens: {
        colors: {
            appBackground: string;
            bookBackground: string;
            paper: string;
            paperAlt: string;
            ink: string;
            mutedInk: string;
            accent: string;
            accentSoft: string;
            shadow: string;
            muted: string;
            tape: string;
            leaf: string;
        };
        fonts: {
            heading: string;
            body: string;
            handwritten: string;
        };
    };
    book: {
        style: string;
        binding: 'left' | 'none';
        background: string;
        spineColor: string;
        mode: 'spread' | 'single';
        spineWidth: number;
        spreadGap: number;
        pageCurl: 'none' | 'subtle';
        foldShadow: boolean;
        transition: 'soft-slide' | 'fade' | 'none';
        transitionIntensity: 'low' | 'medium' | 'high';
        motion: boolean;
    };
    page: {
        surface: string;
        backgroundColor: string;
        texture: string;
        textureAssetRole: string | null;
        edge: string;
        borderRadius: number;
        shadow: string;
        padding: number;
        decorations: {
            cornerTape: boolean;
            paperGrain: boolean;
            subtleStains: boolean;
            edgeWear: boolean;
        };
    };
    textures: {
        appBackground: ThemeTextureLayerConfig | null;
        fabricBackground: ThemeTextureLayerConfig | null;
        bookSurface: ThemeTextureLayerConfig | null;
        bookSpine: ThemeTextureLayerConfig | null;
        pagePaper: ThemeTextureLayerConfig | null;
        kraftSurface: ThemeTextureLayerConfig | null;
        pageOverlay: ThemeTextureLayerConfig | null;
        agingOverlay: ThemeTextureLayerConfig | null;
        stainOverlay: ThemeTextureLayerConfig | null;
        edgeOverlay: ThemeTextureLayerConfig | null;
    };
    elements: {
        text: {
            defaultColor: string;
            headingColor: string;
        };
        image: {
            defaultFrame: string;
            shadow: boolean;
        };
        sticker: {
            shadow: boolean;
            defaultShadow: boolean;
        };
    };
};

export const DEFAULT_THEME_CONFIG: NormalizedThemeConfig = {
    tokens: {
        colors: {
            appBackground: '#F3E7D3',
            bookBackground: '#D8BE96',
            paper: '#FFF8EC',
            paperAlt: '#F7E4C2',
            ink: '#3A2418',
            mutedInk: '#7B5A43',
            accent: '#8E2F2F',
            accentSoft: '#D9A6A1',
            shadow: 'rgba(58,36,24,0.22)',
            muted: '#A77B55',
            tape: '#D9B77E',
            leaf: '#6E7C4F',
        },
        fonts: {
            heading: 'serif',
            body: 'sans',
            handwritten: 'script',
        },
    },
    book: {
        style: 'scrapbook',
        binding: 'left',
        background: '#FBF7ED',
        spineColor: '#7B4F32',
        mode: 'spread',
        spineWidth: 28,
        spreadGap: 0,
        pageCurl: 'subtle',
        foldShadow: true,
        transition: 'soft-slide',
        transitionIntensity: 'medium',
        motion: true,
    },
    page: {
        surface: 'kraft',
        backgroundColor: '#FFF8EC',
        texture: 'paper-grain',
        textureAssetRole: 'paper_texture',
        edge: 'soft-rounded',
        borderRadius: 28,
        shadow: 'deep-paper',
        padding: 56,
        decorations: {
            cornerTape: true,
            paperGrain: true,
            subtleStains: true,
            edgeWear: true,
        },
    },
    textures: {
        appBackground: {
            assetRole: 'background_texture',
            opacity: 0.72,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        fabricBackground: {
            assetRole: 'fabric_background',
            opacity: 0.68,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        bookSurface: {
            assetRole: 'book_texture',
            opacity: 0.58,
            blendMode: 'overlay',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        bookSpine: {
            assetRole: 'spine_texture',
            opacity: 0.62,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        pagePaper: {
            assetRole: 'paper_texture',
            opacity: 0.82,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        kraftSurface: {
            assetRole: 'kraft_surface',
            opacity: 0.74,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        pageOverlay: {
            assetRole: 'page_overlay',
            opacity: 0.18,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        agingOverlay: {
            assetRole: 'aging_overlay',
            opacity: 0.18,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        stainOverlay: {
            assetRole: 'stain_overlay',
            opacity: 0.14,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
        edgeOverlay: {
            assetRole: 'edge_overlay',
            opacity: 0.32,
            blendMode: 'multiply',
            size: 'cover',
            position: 'center',
            repeat: 'no-repeat',
        },
    },
    elements: {
        text: {
            defaultColor: '#3A2418',
            headingColor: '#3A2418',
        },
        image: {
            defaultFrame: 'polaroid',
            shadow: true,
        },
        sticker: {
            shadow: true,
            defaultShadow: true,
        },
    },
};

export function normalizeThemeConfig(config: ThemeConfigInput): NormalizedThemeConfig {
    const record = isRecord(config) ? config : {};
    const tokens = isRecord(record.tokens) ? record.tokens : {};
    const legacyPalette = isRecord(record.palette) ? record.palette : {};
    const colors = isRecord(tokens.colors) ? tokens.colors : legacyPalette;
    const fonts = isRecord(tokens.fonts) ? tokens.fonts : isRecord(record.fonts) ? record.fonts : {};
    const book = isRecord(record.book) ? record.book : {};
    const page = isRecord(record.page) ? record.page : {};
    const decorations = isRecord(page.decorations) ? page.decorations : {};
    const textures = isRecord(record.textures) ? record.textures : {};
    const elements = isRecord(record.elements) ? record.elements : {};
    const text = isRecord(elements.text) ? elements.text : {};
    const image = isRecord(elements.image) ? elements.image : {};
    const sticker = isRecord(elements.sticker) ? elements.sticker : {};

    return {
        tokens: {
            colors: {
                appBackground: colorValue(colors.appBackground, DEFAULT_THEME_CONFIG.tokens.colors.appBackground),
                bookBackground: colorValue(
                    colors.bookBackground ?? book.background,
                    DEFAULT_THEME_CONFIG.tokens.colors.bookBackground,
                ),
                paper: colorValue(colors.paper, DEFAULT_THEME_CONFIG.tokens.colors.paper),
                paperAlt: colorValue(colors.paperAlt, DEFAULT_THEME_CONFIG.tokens.colors.paperAlt),
                ink: colorValue(colors.ink ?? colors.text, DEFAULT_THEME_CONFIG.tokens.colors.ink),
                mutedInk: colorValue(
                    colors.mutedInk ?? colors.muted ?? colors.kraft,
                    DEFAULT_THEME_CONFIG.tokens.colors.mutedInk,
                ),
                accent: colorValue(colors.accent ?? colors.primary, DEFAULT_THEME_CONFIG.tokens.colors.accent),
                accentSoft: colorValue(colors.accentSoft, DEFAULT_THEME_CONFIG.tokens.colors.accentSoft),
                shadow: colorValue(colors.shadow, DEFAULT_THEME_CONFIG.tokens.colors.shadow),
                muted: colorValue(colors.muted ?? colors.kraft, DEFAULT_THEME_CONFIG.tokens.colors.muted),
                tape: colorValue(colors.tape, DEFAULT_THEME_CONFIG.tokens.colors.tape),
                leaf: colorValue(colors.leaf ?? colors.olive, DEFAULT_THEME_CONFIG.tokens.colors.leaf),
            },
            fonts: {
                heading: stringValue(fonts.heading ?? fonts.title, DEFAULT_THEME_CONFIG.tokens.fonts.heading),
                body: stringValue(fonts.body, DEFAULT_THEME_CONFIG.tokens.fonts.body),
                handwritten: stringValue(fonts.handwritten, DEFAULT_THEME_CONFIG.tokens.fonts.handwritten),
            },
        },
        book: {
            style: stringValue(book.style, DEFAULT_THEME_CONFIG.book.style),
            binding: book.binding === 'none' ? 'none' : 'left',
            background: colorValue(book.background, DEFAULT_THEME_CONFIG.book.background),
            spineColor: colorValue(book.spineColor, DEFAULT_THEME_CONFIG.book.spineColor),
            mode: book.mode === 'single' ? 'single' : 'spread',
            spineWidth: clampedNumberValue(book.spineWidth, DEFAULT_THEME_CONFIG.book.spineWidth, 8, 72),
            spreadGap: clampedNumberValue(book.spreadGap, DEFAULT_THEME_CONFIG.book.spreadGap, 0, 32),
            pageCurl: book.pageCurl === 'none' ? 'none' : 'subtle',
            foldShadow: booleanValue(book.foldShadow, DEFAULT_THEME_CONFIG.book.foldShadow),
            transition:
                book.transition === 'fade' || book.transition === 'none'
                    ? book.transition
                    : DEFAULT_THEME_CONFIG.book.transition,
            transitionIntensity:
                book.transitionIntensity === 'low' || book.transitionIntensity === 'high'
                    ? book.transitionIntensity
                    : DEFAULT_THEME_CONFIG.book.transitionIntensity,
            motion: booleanValue(book.motion, DEFAULT_THEME_CONFIG.book.motion),
        },
        page: {
            surface: stringValue(page.surface, DEFAULT_THEME_CONFIG.page.surface),
            backgroundColor: colorValue(page.backgroundColor, DEFAULT_THEME_CONFIG.page.backgroundColor),
            texture: stringValue(page.texture, DEFAULT_THEME_CONFIG.page.texture),
            textureAssetRole:
                typeof page.textureAssetRole === 'string'
                    ? page.textureAssetRole
                    : DEFAULT_THEME_CONFIG.page.textureAssetRole,
            edge: stringValue(page.edge, DEFAULT_THEME_CONFIG.page.edge),
            borderRadius: numberValue(page.borderRadius, DEFAULT_THEME_CONFIG.page.borderRadius),
            shadow: stringValue(page.shadow, DEFAULT_THEME_CONFIG.page.shadow),
            padding: numberValue(page.padding, DEFAULT_THEME_CONFIG.page.padding),
            decorations: {
                cornerTape: booleanValue(decorations.cornerTape, DEFAULT_THEME_CONFIG.page.decorations.cornerTape),
                paperGrain: booleanValue(decorations.paperGrain, DEFAULT_THEME_CONFIG.page.decorations.paperGrain),
                subtleStains: booleanValue(
                    decorations.subtleStains,
                    DEFAULT_THEME_CONFIG.page.decorations.subtleStains,
                ),
                edgeWear: booleanValue(decorations.edgeWear, DEFAULT_THEME_CONFIG.page.decorations.edgeWear),
            },
        },
        textures: {
            appBackground: textureLayerValue(textures.appBackground, DEFAULT_THEME_CONFIG.textures.appBackground),
            fabricBackground: textureLayerValue(
                textures.fabricBackground,
                DEFAULT_THEME_CONFIG.textures.fabricBackground,
            ),
            bookSurface: textureLayerValue(textures.bookSurface, DEFAULT_THEME_CONFIG.textures.bookSurface),
            bookSpine: textureLayerValue(textures.bookSpine, DEFAULT_THEME_CONFIG.textures.bookSpine),
            pagePaper: textureLayerValue(textures.pagePaper, DEFAULT_THEME_CONFIG.textures.pagePaper),
            kraftSurface: textureLayerValue(textures.kraftSurface, DEFAULT_THEME_CONFIG.textures.kraftSurface),
            pageOverlay: textureLayerValue(textures.pageOverlay, DEFAULT_THEME_CONFIG.textures.pageOverlay),
            agingOverlay: textureLayerValue(textures.agingOverlay, DEFAULT_THEME_CONFIG.textures.agingOverlay),
            stainOverlay: textureLayerValue(textures.stainOverlay, DEFAULT_THEME_CONFIG.textures.stainOverlay),
            edgeOverlay: textureLayerValue(textures.edgeOverlay, DEFAULT_THEME_CONFIG.textures.edgeOverlay),
        },
        elements: {
            text: {
                defaultColor: colorValue(text.defaultColor, DEFAULT_THEME_CONFIG.elements.text.defaultColor),
                headingColor: colorValue(
                    text.headingColor ?? text.defaultColor,
                    DEFAULT_THEME_CONFIG.elements.text.headingColor,
                ),
            },
            image: {
                defaultFrame: stringValue(image.defaultFrame, DEFAULT_THEME_CONFIG.elements.image.defaultFrame),
                shadow: booleanValue(image.shadow, DEFAULT_THEME_CONFIG.elements.image.shadow),
            },
            sticker: {
                shadow: booleanValue(
                    sticker.shadow ?? sticker.defaultShadow,
                    DEFAULT_THEME_CONFIG.elements.sticker.shadow,
                ),
                defaultShadow: booleanValue(
                    sticker.defaultShadow ?? sticker.shadow,
                    DEFAULT_THEME_CONFIG.elements.sticker.defaultShadow,
                ),
            },
        },
    };
}

export function themeColor(theme: NormalizedThemeConfig, key: keyof NormalizedThemeConfig['tokens']['colors']): string {
    return theme.tokens.colors[key];
}

export function resolveThemeColor(
    theme: NormalizedThemeConfig,
    color: unknown,
    fallback = theme.tokens.colors.ink,
): string {
    if (typeof color !== 'string') {
        return fallback;
    }

    const token = color.match(/^var\(--(?:scrap-)?([a-zA-Z0-9_-]+)\)$/)?.[1];

    if (token && token in theme.tokens.colors) {
        return theme.tokens.colors[token as keyof NormalizedThemeConfig['tokens']['colors']];
    }

    if (isSafeCssColor(color)) {
        return color;
    }

    return fallback;
}

export function fontFamilyForToken(theme: NormalizedThemeConfig, token: unknown): string {
    const normalizedToken = typeof token === 'string' ? token : 'body';
    const family =
        normalizedToken === 'title' || normalizedToken === 'heading'
            ? theme.tokens.fonts.heading
            : normalizedToken === 'handwritten' || normalizedToken === 'script'
              ? theme.tokens.fonts.handwritten
              : theme.tokens.fonts.body;

    if (family === 'serif') {
        return 'var(--font-editorial), Georgia, serif';
    }

    if (family === 'script' || family === 'cursive') {
        return 'var(--font-hand), cursive';
    }

    return 'var(--font-sans), ui-sans-serif, system-ui, sans-serif';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function numberValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampedNumberValue(value: unknown, fallback: number, min: number, max: number): number {
    const number = numberValue(value, fallback);

    return Math.max(min, Math.min(max, number));
}

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function colorValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && isSafeCssColor(value) ? value : fallback;
}

function textureLayerValue(value: unknown, fallback: ThemeTextureLayerConfig | null): ThemeTextureLayerConfig | null {
    const record = isRecord(value) ? value : {};
    const assetRole = stringValueOrNull(record.assetRole ?? record.role) ?? fallback?.assetRole ?? null;
    const assetId = safeAssetId(record.assetId) ?? fallback?.assetId ?? null;

    if (!assetRole && !assetId) {
        return null;
    }

    return {
        assetRole,
        assetId,
        opacity: opacityValue(record.opacity, fallback?.opacity ?? 1),
        blendMode: blendModeValue(record.blendMode, fallback?.blendMode ?? 'normal'),
        size: backgroundSizeValue(record.size, fallback?.size ?? 'cover'),
        position: backgroundPositionValue(record.position, fallback?.position ?? 'center'),
        repeat: backgroundRepeatValue(record.repeat, fallback?.repeat ?? 'no-repeat'),
    };
}

function stringValueOrNull(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function safeAssetId(value: unknown): string | number | null {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }

    const id = String(value).trim();

    return /^[A-Za-z0-9_-]{4,80}$/.test(id) ? value : null;
}

function opacityValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

function blendModeValue(value: unknown, fallback: string): string {
    const allowed = new Set([
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'soft-light',
        'hard-light',
        'color-burn',
        'luminosity',
    ]);

    return typeof value === 'string' && allowed.has(value) ? value : fallback;
}

function backgroundSizeValue(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();

    if (['auto', 'cover', 'contain'].includes(trimmed)) {
        return trimmed;
    }

    return /^(?:\d{1,4}(?:px|%)|auto)(?:\s+(?:\d{1,4}(?:px|%)|auto))?$/.test(trimmed) ? trimmed : fallback;
}

function backgroundPositionValue(value: unknown, fallback: string): string {
    if (typeof value !== 'string') {
        return fallback;
    }

    const trimmed = value.trim();

    return /^(?:left|right|center|top|bottom|\d{1,3}%)(?:\s+(?:left|right|center|top|bottom|\d{1,3}%))?$/.test(trimmed)
        ? trimmed
        : fallback;
}

function backgroundRepeatValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'].includes(value)
        ? value
        : fallback;
}

function isSafeCssColor(value: string): boolean {
    return (
        /^#[0-9a-f]{3,8}$/i.test(value) ||
        value.startsWith('rgb(') ||
        value.startsWith('rgba(') ||
        value.startsWith('var(--scrap-')
    );
}
