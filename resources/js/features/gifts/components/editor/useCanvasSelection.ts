import { useMemo, useState } from 'react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { isTransformableElement } from './canvasTransformUtils';

export function useCanvasSelection(canvas: Canvas | null) {
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const selectedElement = useMemo<CanvasElement | null>(() => {
        if (!canvas || !selectedElementId) {
            return null;
        }

        const element = canvas.elements.find((item) => item.id === selectedElementId) ?? null;

        return isTransformableElement(element) ? element : null;
    }, [canvas, selectedElementId]);

    const normalizedSelectedElementId = selectedElement?.id ?? null;

    return {
        clearSelection: () => setSelectedElementId(null),
        selectedElement,
        selectedElementId: normalizedSelectedElementId,
        selectElement: setSelectedElementId,
    };
}
