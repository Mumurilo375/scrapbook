import type { ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import type { RendererAssetMap } from './assetTypes';
import { CanvasElementLayer } from './CanvasElementLayer';
import { PageSurface } from './PageSurface';
import { ScrapbookPageFrame } from './ScrapbookPageFrame';
import { ThemedArtboard } from './ThemedArtboard';
import { normalizeThemeConfig, type RendererContext, type ThemeConfigInput } from './theme';

type PageRendererProps = {
    canvas: Canvas;
    assets?: RendererAssetMap;
    children?: ReactNode;
    context?: RendererContext;
    framed?: boolean;
    onElementClick?: (element: Canvas['elements'][number]) => void;
    onMediaDrop?: (element: Canvas['elements'][number], mediaItemId: string) => void;
    selectedElementId?: string | null;
    theme?: ThemeConfigInput;
};

export function PageRenderer({
    assets,
    canvas,
    children,
    context = 'preview',
    framed = true,
    onElementClick,
    onMediaDrop,
    selectedElementId = null,
    theme,
}: PageRendererProps) {
    const normalizedTheme = normalizeThemeConfig(theme);
    const page = (
        <PageSurface assets={assets} canvas={canvas} context={context} theme={normalizedTheme}>
            <ThemedArtboard canvas={canvas} theme={normalizedTheme}>
                <CanvasElementLayer
                    assets={assets}
                    canvas={canvas}
                    context={context}
                    onElementClick={onElementClick}
                    onMediaDrop={onMediaDrop}
                    selectedElementId={selectedElementId}
                    theme={normalizedTheme}
                />
                {children}
            </ThemedArtboard>
        </PageSurface>
    );

    if (!framed) {
        return page;
    }

    return (
        <ScrapbookPageFrame assets={assets} canvas={canvas} context={context} theme={normalizedTheme}>
            {page}
        </ScrapbookPageFrame>
    );
}
