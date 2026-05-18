import type { CSSProperties, ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import type { NormalizedThemeConfig } from './theme';

type ThemedArtboardProps = {
    canvas: Canvas;
    children: ReactNode;
    theme: NormalizedThemeConfig;
};

export function ThemedArtboard({ canvas, children, theme }: ThemedArtboardProps) {
    const style = {
        '--scrap-artboard-width': canvas.artboard.width,
        '--scrap-artboard-height': canvas.artboard.height,
        color: theme.tokens.colors.ink,
    } as CSSProperties;

    return (
        <div className="relative h-full w-full" style={style}>
            {children}
        </div>
    );
}
