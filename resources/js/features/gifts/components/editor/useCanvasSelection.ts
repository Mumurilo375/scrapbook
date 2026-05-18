import { useMemo, useState } from 'react';

import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';

export function useCanvasSelection(canvas: Canvas | null) {
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const selectedElement = useMemo<CanvasElement | null>(() => {
        if (!canvas || !selectedElementId) {
            return null;
        }

        const element = canvas.elements.find((item) => item.id === selectedElementId) ?? null;

        return element;
    }, [canvas, selectedElementId]);

    const normalizedSelectedElementId = selectedElement?.id ?? null;

    return {
        clearSelection: () => setSelectedElementId(null),
        selectedElement,
        selectedElementId: normalizedSelectedElementId,
        selectElement: setSelectedElementId,
    };
}
