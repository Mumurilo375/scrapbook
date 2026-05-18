import type { Canvas, CanvasElement } from '../../domain/canvas/schema';
import { ElementRenderer } from './ElementRenderer';
import type { NormalizedThemeConfig } from './theme';

type CanvasElementLayerProps = {
    canvas: Canvas;
    onElementClick?: (element: CanvasElement) => void;
    onMediaDrop?: (element: CanvasElement, mediaItemId: string) => void;
    selectedElementId?: string | null;
    theme: NormalizedThemeConfig;
};

export function CanvasElementLayer({
    canvas,
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
                .sort((a, b) => a.z - b.z)
                .map((element) => (
                    <ElementRenderer
                        artboard={{ height, width }}
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
