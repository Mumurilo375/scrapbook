import { useMemo, type RefObject } from 'react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { isElementHidden, isTransformableElement } from './canvasTransformUtils';
import { SelectableElement } from './SelectableElement';
import { sortedElements } from './layerUtils';
import { useElementTransform, type TransformMode } from './useElementTransform';

type SelectionOverlayProps = {
    artboardRef: RefObject<HTMLDivElement | null>;
    canvas: Canvas;
    disabled: boolean;
    onChangeElement: (elementId: string, nextElement: CanvasElement) => void;
    onClearSelection: () => void;
    onElementClick?: (element: CanvasElement) => void;
    onElementDoubleClick?: (element: CanvasElement) => void;
    onSelectElement: (elementId: string) => void;
    onTransformEnd?: (elementId: string, mode: TransformMode) => void;
    onTransformStart?: (elementId: string, mode: TransformMode) => void;
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
    onTransformEnd,
    onTransformStart,
    selectedElementId,
}: SelectionOverlayProps) {
    const transform = useElementTransform({
        artboardRef,
        canvas,
        disabled,
        onChangeElement,
        onElementClick,
        onSelectElement,
        onTransformEnd,
        onTransformStart,
    });
    const selectableElements = useMemo(
        () => sortedElements(canvas).filter((element) => isTransformableElement(element) && !isElementHidden(element)),
        [canvas],
    );

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
            {selectableElements.map((element) => (
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
