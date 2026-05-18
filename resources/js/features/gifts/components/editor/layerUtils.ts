import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { assetFromMap, type RendererAssetMap } from '../../../../components/renderer';
import { LAYER_STEP } from './canvasTransformUtils';

export type LayerAction = 'bring-front' | 'send-back' | 'forward' | 'backward';

export type DeleteElementResult = {
    canvas: Canvas;
    deleted: boolean;
    nextSelectedElementId: string | null;
};

export type DuplicateElementResult = {
    canvas: Canvas;
    duplicatedElementId: string | null;
};

const DUPLICATE_OFFSET = 28;
const MAX_LAYER_NAME_LENGTH = 80;

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
    if (action === 'bring-front') {
        return bringToFront(canvas, elementId);
    }

    if (action === 'send-back') {
        return sendToBack(canvas, elementId);
    }

    if (action === 'forward') {
        return moveForward(canvas, elementId);
    }

    return moveBackward(canvas, elementId);
}

export function bringToFront(canvas: Canvas, elementId: string): Canvas {
    return moveElementInLayerStack(canvas, elementId, 'front');
}

export function sendToBack(canvas: Canvas, elementId: string): Canvas {
    return moveElementInLayerStack(canvas, elementId, 'back');
}

export function moveForward(canvas: Canvas, elementId: string): Canvas {
    return moveElementInLayerStack(canvas, elementId, 'forward');
}

export function moveBackward(canvas: Canvas, elementId: string): Canvas {
    return moveElementInLayerStack(canvas, elementId, 'backward');
}

export function duplicateElement(canvas: Canvas, elementId: string): DuplicateElementResult {
    const sorted = sortedElements(canvas);
    const original = sorted.find((element) => element.id === elementId);

    if (!original) {
        return { canvas, duplicatedElementId: null };
    }

    const originalIndex = sorted.findIndex((element) => element.id === elementId);
    const duplicatedElementId = uniqueElementId(canvas, `${original.type}_copy`);
    const duplicatedElement: CanvasElement = {
        ...JSON.parse(JSON.stringify(original)),
        id: duplicatedElementId,
        name: duplicateName(original),
        x: offsetWithinArtboard(original.x, original.w, canvas.artboard.width),
        y: offsetWithinArtboard(original.y, original.h, canvas.artboard.height),
        z: safeZ(original) + 1,
        locked: false,
        hidden: false,
    };
    const nextStack = [...sorted];
    nextStack.splice(originalIndex + 1, 0, duplicatedElement);
    const zById = new Map(nextStack.map((item, index) => [item.id, (index + 1) * LAYER_STEP]));

    return {
        duplicatedElementId,
        canvas: {
            ...canvas,
            elements: [
                ...canvas.elements.map((element, index) => ({
                    ...element,
                    z: zById.get(element.id) ?? (index + 1) * LAYER_STEP,
                })),
                {
                    ...duplicatedElement,
                    z: zById.get(duplicatedElement.id) ?? (originalIndex + 2) * LAYER_STEP,
                },
            ],
        },
    };
}

export function deleteElement(canvas: Canvas, elementId: string): DeleteElementResult {
    const element = canvas.elements.find((item) => item.id === elementId);

    if (!element || isElementLocked(element)) {
        return { canvas, deleted: false, nextSelectedElementId: elementId };
    }

    const sorted = sortedElements(canvas);
    const currentIndex = sorted.findIndex((item) => item.id === elementId);
    const nextSorted = sorted.filter((item) => item.id !== elementId);
    const fallbackElement = nextSorted[Math.min(currentIndex, nextSorted.length - 1)] ?? nextSorted.at(-1) ?? null;
    const nextCanvas = normalizeCanvasLayerOrder({
        ...canvas,
        elements: canvas.elements.filter((item) => item.id !== elementId),
    });

    return {
        canvas: nextCanvas,
        deleted: true,
        nextSelectedElementId: fallbackElement?.id ?? null,
    };
}

export function toggleLocked(canvas: Canvas, elementId: string): Canvas {
    return updateLayerElement(canvas, elementId, (element) => ({
        ...element,
        locked: !isElementLocked(element),
    }));
}

export function toggleHidden(canvas: Canvas, elementId: string): Canvas {
    return updateLayerElement(canvas, elementId, (element) => ({
        ...element,
        hidden: !isElementHidden(element),
    }));
}

export function renameElement(canvas: Canvas, elementId: string, name: string): Canvas {
    const normalizedName = name.trim().slice(0, MAX_LAYER_NAME_LENGTH);

    return updateLayerElement(canvas, elementId, (element) => {
        if (normalizedName === '') {
            const nextElement = { ...element };
            delete (nextElement as CanvasElement & Record<string, unknown>).name;

            return nextElement;
        }

        return {
            ...element,
            name: normalizedName,
        };
    });
}

export function sortElementsByLayer(canvas: Canvas): CanvasElement[] {
    return sortedElements(canvas);
}

export function getLayerName(element: CanvasElement, assets?: RendererAssetMap): string {
    const record = element as CanvasElement & Record<string, unknown>;
    const customName = typeof record.name === 'string' ? record.name.trim() : '';

    if (customName !== '') {
        return truncateLabel(customName, 42);
    }

    if (element.type === 'text') {
        const text = stringValue(record.text) || stringValue(record.content);

        return text !== '' ? `Texto: ${truncateLabel(text, 34)}` : 'Texto';
    }

    if (element.type === 'image') {
        return 'Imagem';
    }

    if (element.type === 'sticker') {
        const asset = assetFromMap(assets, record.assetId ?? record.asset_id);
        const assetName = typeof asset?.name === 'string' ? asset.name.trim() : '';
        const text = stringValue(record.text) || stringValue(record.content) || stringValue(record.label);

        if (assetName !== '') {
            return `Adesivo: ${truncateLabel(assetName, 32)}`;
        }

        return text !== '' ? `Adesivo: ${truncateLabel(text, 32)}` : 'Adesivo';
    }

    if (element.type === 'music') {
        return 'Música';
    }

    return 'Elemento';
}

export function getLayerTypeLabel(type: string): string {
    if (type === 'text') {
        return 'Texto';
    }

    if (type === 'image') {
        return 'Imagem';
    }

    if (type === 'sticker') {
        return 'Adesivo';
    }

    if (type === 'music') {
        return 'Música';
    }

    return 'Elemento';
}

export function isElementHidden(element: CanvasElement | null | undefined): boolean {
    return (element as Record<string, unknown> | null | undefined)?.hidden === true;
}

export function isElementLocked(element: CanvasElement | null | undefined): boolean {
    return (element as Record<string, unknown> | null | undefined)?.locked === true;
}

function moveElementInLayerStack(canvas: Canvas, elementId: string, action: LayerAction | 'front' | 'back'): Canvas {
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

    if (action === 'bring-front' || action === 'front') {
        next.push(element);
    } else if (action === 'send-back' || action === 'back') {
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

function updateLayerElement(canvas: Canvas, elementId: string, updater: (element: CanvasElement) => CanvasElement): Canvas {
    return {
        ...canvas,
        elements: canvas.elements.map((element) => (element.id === elementId ? updater(element) : element)),
    };
}

function offsetWithinArtboard(position: number, size: number, artboardSize: number): number {
    const max = Math.max(0, artboardSize - size);

    if (position + DUPLICATE_OFFSET <= max) {
        return Math.round((position + DUPLICATE_OFFSET) * 100) / 100;
    }

    return Math.max(0, Math.round((position - DUPLICATE_OFFSET) * 100) / 100);
}

function duplicateName(element: CanvasElement): string | undefined {
    const name = (element as CanvasElement & Record<string, unknown>).name;

    if (typeof name !== 'string' || name.trim() === '') {
        return undefined;
    }

    return `Cópia de ${name.trim()}`.slice(0, MAX_LAYER_NAME_LENGTH);
}

function uniqueElementId(canvas: Canvas, prefix: string): string {
    const existingIds = new Set(canvas.elements.map((element) => element.id));
    const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'element';

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const suffix =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const candidate = `${safePrefix}_${suffix}`;

        if (!existingIds.has(candidate)) {
            return candidate;
        }
    }

    return `${safePrefix}_${existingIds.size + 1}`;
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function truncateLabel(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 3))}...` : value;
}
