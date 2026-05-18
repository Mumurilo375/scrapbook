import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { LAYER_STEP } from './canvasTransformUtils';

export type LayerAction = 'bring-front' | 'send-back' | 'forward' | 'backward';

export function normalizeCanvasLayerOrder(canvas: Canvas): Canvas {
    const sortedIds = sortedElements(canvas).map((element) => element.id);
    const zById = new Map(sortedIds.map((id, index) => [id, (index + 1) * LAYER_STEP]));

    return {
        ...canvas,
        elements: canvas.elements.map((element, index) => ({
            ...element,
            z: zById.get(element.id) ?? (index + 1) * LAYER_STEP,
        })),
    };
}

export function applyLayerAction(canvas: Canvas, elementId: string, action: LayerAction): Canvas {
    const sorted = sortedElements(canvas);
    const currentIndex = sorted.findIndex((element) => element.id === elementId);

    if (currentIndex < 0) {
        return canvas;
    }

    const next = [...sorted];
    const [element] = next.splice(currentIndex, 1);

    if (!element) {
        return canvas;
    }

    if (action === 'bring-front') {
        next.push(element);
    } else if (action === 'send-back') {
        next.unshift(element);
    } else if (action === 'forward') {
        next.splice(Math.min(currentIndex + 1, next.length), 0, element);
    } else {
        next.splice(Math.max(currentIndex - 1, 0), 0, element);
    }

    const zById = new Map(next.map((item, index) => [item.id, (index + 1) * LAYER_STEP]));

    return {
        ...canvas,
        elements: canvas.elements.map((item, index) => ({
            ...item,
            z: zById.get(item.id) ?? (index + 1) * LAYER_STEP,
        })),
    };
}

export function sortedElements(canvas: Canvas): CanvasElement[] {
    return [...canvas.elements].sort((left, right) => {
        const zDelta = safeZ(left) - safeZ(right);

        if (zDelta !== 0) {
            return zDelta;
        }

        return canvas.elements.indexOf(left) - canvas.elements.indexOf(right);
    });
}

function safeZ(element: CanvasElement): number {
    return typeof element.z === 'number' && Number.isFinite(element.z) ? element.z : 0;
}
