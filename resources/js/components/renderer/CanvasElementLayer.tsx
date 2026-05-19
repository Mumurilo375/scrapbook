import type { Canvas, CanvasElement } from '../../domain/canvas/schema';
import type { RendererAssetMap } from './assetTypes';
import { ElementRenderer } from './ElementRenderer';
import type { NormalizedThemeConfig, RendererContext } from './theme';

type CanvasElementLayerProps = {
    canvas: Canvas;
    context?: RendererContext;
    onElementClick?: (element: CanvasElement) => void;
    onMediaDrop?: (element: CanvasElement, mediaItemId: string) => void;
    selectedElementId?: string | null;
    assets?: RendererAssetMap;
    theme: NormalizedThemeConfig;
};

export function CanvasElementLayer({
    assets,
    canvas,
    context = 'preview',
    onElementClick,
    onMediaDrop,
    selectedElementId = null,
    theme,
}: CanvasElementLayerProps) {
    const width = canvas.artboard.width;
    const height = canvas.artboard.height;

    return (
        <>
            {[...canvas.elements]
                .filter((element) => !isElementHidden(element))
                .sort((a, b) => a.z - b.z)
                .map((element) => (
                    <ElementRenderer
                        artboard={{ height, width }}
                        assets={assets}
                        context={context}
                        element={element}
                        key={element.id}
                        onElementClick={onElementClick}
                        onMediaDrop={onMediaDrop}
                        selectedElementId={selectedElementId}
                        theme={theme}
                    />
                ))}
        </>
    );
}

function isElementHidden(element: CanvasElement): boolean {
    return (element as CanvasElement & Record<string, unknown>).hidden === true;
}
