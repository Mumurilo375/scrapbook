export type RendererContext = 'editor' | 'preview' | 'public';

export type ThemeConfigInput = Record<string, unknown> | null | undefined;

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
        background: '#F3E7D3',
        spineColor: '#7B4F32',
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
    const elements = isRecord(record.elements) ? record.elements : {};
    const text = isRecord(elements.text) ? elements.text : {};
    const image = isRecord(elements.image) ? elements.image : {};
    const sticker = isRecord(elements.sticker) ? elements.sticker : {};

    return {
        tokens: {
            colors: {
                appBackground: colorValue(colors.appBackground, DEFAULT_THEME_CONFIG.tokens.colors.appBackground),
                bookBackground: colorValue(colors.bookBackground ?? book.background, DEFAULT_THEME_CONFIG.tokens.colors.bookBackground),
                paper: colorValue(colors.paper, DEFAULT_THEME_CONFIG.tokens.colors.paper),
                paperAlt: colorValue(colors.paperAlt, DEFAULT_THEME_CONFIG.tokens.colors.paperAlt),
                ink: colorValue(colors.ink ?? colors.text, DEFAULT_THEME_CONFIG.tokens.colors.ink),
                mutedInk: colorValue(colors.mutedInk ?? colors.muted ?? colors.kraft, DEFAULT_THEME_CONFIG.tokens.colors.mutedInk),
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
        },
        page: {
            surface: stringValue(page.surface, DEFAULT_THEME_CONFIG.page.surface),
            backgroundColor: colorValue(page.backgroundColor, DEFAULT_THEME_CONFIG.page.backgroundColor),
            texture: stringValue(page.texture, DEFAULT_THEME_CONFIG.page.texture),
            textureAssetRole: typeof page.textureAssetRole === 'string' ? page.textureAssetRole : DEFAULT_THEME_CONFIG.page.textureAssetRole,
            edge: stringValue(page.edge, DEFAULT_THEME_CONFIG.page.edge),
            borderRadius: numberValue(page.borderRadius, DEFAULT_THEME_CONFIG.page.borderRadius),
            shadow: stringValue(page.shadow, DEFAULT_THEME_CONFIG.page.shadow),
            padding: numberValue(page.padding, DEFAULT_THEME_CONFIG.page.padding),
            decorations: {
                cornerTape: booleanValue(decorations.cornerTape, DEFAULT_THEME_CONFIG.page.decorations.cornerTape),
                paperGrain: booleanValue(decorations.paperGrain, DEFAULT_THEME_CONFIG.page.decorations.paperGrain),
                subtleStains: booleanValue(decorations.subtleStains, DEFAULT_THEME_CONFIG.page.decorations.subtleStains),
                edgeWear: booleanValue(decorations.edgeWear, DEFAULT_THEME_CONFIG.page.decorations.edgeWear),
            },
        },
        elements: {
            text: {
                defaultColor: colorValue(text.defaultColor, DEFAULT_THEME_CONFIG.elements.text.defaultColor),
                headingColor: colorValue(text.headingColor ?? text.defaultColor, DEFAULT_THEME_CONFIG.elements.text.headingColor),
            },
            image: {
                defaultFrame: stringValue(image.defaultFrame, DEFAULT_THEME_CONFIG.elements.image.defaultFrame),
                shadow: booleanValue(image.shadow, DEFAULT_THEME_CONFIG.elements.image.shadow),
            },
            sticker: {
                shadow: booleanValue(sticker.shadow ?? sticker.defaultShadow, DEFAULT_THEME_CONFIG.elements.sticker.shadow),
                defaultShadow: booleanValue(sticker.defaultShadow ?? sticker.shadow, DEFAULT_THEME_CONFIG.elements.sticker.defaultShadow),
            },
        },
    };
}

export function themeColor(theme: NormalizedThemeConfig, key: keyof NormalizedThemeConfig['tokens']['colors']): string {
    return theme.tokens.colors[key];
}

export function resolveThemeColor(theme: NormalizedThemeConfig, color: unknown, fallback = theme.tokens.colors.ink): string {
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
    const family = normalizedToken === 'title' || normalizedToken === 'heading'
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

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function colorValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && isSafeCssColor(value) ? value : fallback;
}

function isSafeCssColor(value: string): boolean {
    return /^#[0-9a-f]{3,8}$/i.test(value) || value.startsWith('rgb(') || value.startsWith('rgba(') || value.startsWith('var(--scrap-');
}
