import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import type { NormalizedThemeConfig } from './theme';

type StickerElementProps = {
    element: CanvasElement;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function StickerElement({ element, style, theme }: StickerElementProps) {
    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <div
            className="absolute flex items-center justify-center rounded-full px-2 text-center font-semibold"
            style={{
                ...style,
                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.accentSoft} 42%, ${theme.tokens.colors.paper})`,
                border: `1px solid color-mix(in srgb, ${theme.tokens.colors.accent} 28%, transparent)`,
                boxShadow: theme.elements.sticker.shadow ? `0 9px 18px ${theme.tokens.colors.shadow}` : undefined,
                color: theme.tokens.colors.accent,
                fontSize: '3cqw',
            }}
        >
            {label}
        </div>
    );
}
