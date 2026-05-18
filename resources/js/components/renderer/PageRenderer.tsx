import type { ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import { CanvasElementLayer } from './CanvasElementLayer';
import { PageSurface } from './PageSurface';
import { ScrapbookPageFrame } from './ScrapbookPageFrame';
import { ThemedArtboard } from './ThemedArtboard';
import { normalizeThemeConfig, type RendererContext, type ThemeConfigInput } from './theme';

type PageRendererProps = {
    canvas: Canvas;
    children?: ReactNode;
    context?: RendererContext;
    onElementClick?: (element: Canvas['elements'][number]) => void;
    onMediaDrop?: (element: Canvas['elements'][number], mediaItemId: string) => void;
    selectedElementId?: string | null;
    theme?: ThemeConfigInput;
};

export function PageRenderer({
    canvas,
    children,
    context = 'preview',
    onElementClick,
    onMediaDrop,
    selectedElementId = null,
    theme,
}: PageRendererProps) {
    const normalizedTheme = normalizeThemeConfig(theme);

    return (
        <ScrapbookPageFrame canvas={canvas} context={context} theme={normalizedTheme}>
            <PageSurface canvas={canvas} context={context} theme={normalizedTheme}>
                <ThemedArtboard canvas={canvas} theme={normalizedTheme}>
                    <CanvasElementLayer
                        canvas={canvas}
                        onElementClick={onElementClick}
                        onMediaDrop={onMediaDrop}
                        selectedElementId={selectedElementId}
                        theme={normalizedTheme}
                    />
                    {children}
                </ThemedArtboard>
            </PageSurface>
        </ScrapbookPageFrame>
    );
}
