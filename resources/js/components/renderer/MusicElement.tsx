import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import type { NormalizedThemeConfig } from './theme';

type MusicElementProps = {
    element: CanvasElement;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function MusicElement({ element, style, theme }: MusicElementProps) {
    const title = typeof element.title === 'string' ? element.title : 'Musica';

    return (
        <div
            className="absolute flex items-center rounded-[10px] border px-3 font-semibold"
            style={{
                ...style,
                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.leaf} 16%, ${theme.tokens.colors.paper})`,
                borderColor: theme.tokens.colors.leaf,
                color: theme.tokens.colors.leaf,
                fontSize: '3cqw',
            }}
        >
            {title}
        </div>
    );
}
