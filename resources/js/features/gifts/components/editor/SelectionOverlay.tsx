import type { RefObject } from 'react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { isTransformableElement } from './canvasTransformUtils';
import { SelectableElement } from './SelectableElement';
import { sortedElements } from './layerUtils';
import { useElementTransform } from './useElementTransform';

type SelectionOverlayProps = {
    artboardRef: RefObject<HTMLDivElement | null>;
    canvas: Canvas;
    disabled: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onClearSelection: () => void;
    onElementClick?: (element: CanvasElement) => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    selectedElementId: string | null;
};

export function SelectionOverlay({
    artboardRef,
    canvas,
    disabled,
    onChangeElement,
    onClearSelection,
    onElementClick,
    onElementDoubleClick,
    onSelectElement,
    selectedElementId,
}: SelectionOverlayProps) {
    const transform = useElementTransform({
        artboardRef,
        canvas,
        disabled,
        onChangeElement,
        onElementClick,
        onSelectElement,
    });

    return (
        <div
            className="absolute inset-0 z-[2000] touch-none"
            onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClearSelection();
                }
            }}
            onPointerMove={transform.updateTransform}
            onPointerUp={transform.endTransform}
            onPointerCancel={transform.endTransform}
        >
            {sortedElements(canvas)
                .filter(isTransformableElement)
                .map((element) => (
                    <SelectableElement
                        canvas={canvas}
                        disabled={disabled}
                        element={element}
                        key={element.id}
                        onDoubleClick={onElementDoubleClick}
                        onPointerDown={transform.beginTransform}
                        selected={selectedElementId === element.id}
                    />
                ))}
        </div>
    );
}
