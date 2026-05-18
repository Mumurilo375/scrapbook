import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import type { PointerEvent as ReactPointerEvent } from 'react';

export const MIN_ELEMENT_WIDTH = 24;
export const MIN_ELEMENT_HEIGHT = 24;
export const LAYER_STEP = 10;

const MAX_ELEMENT_MULTIPLIER = 2;
const OUTSIDE_ARTBOARD_RATIO = 0.85;

export type TransformableElementType = 'text' | 'image' | 'sticker';

export type ElementPatch = Partial<Pick<CanvasElement, 'x' | 'y' | 'w' | 'h' | 'rotation' | 'z'>> & {
    style?: Record<string, unknown>;
    text?: string;
    content?: string;
};

export function isTransformableElement(element: CanvasElement | null | undefined): element is CanvasElement {
    return element?.type === 'text' || element?.type === 'image' || element?.type === 'sticker';
}

export function isTextEditableElement(element: CanvasElement | null | undefined): element is CanvasElement {
    if (!element) {
        return false;
    }

    return element.type === 'text' || isEditableStickerText(element);
}

export function isEditableStickerText(element: CanvasElement | null | undefined): element is CanvasElement {
    if (!element || element.type !== 'sticker') {
        return false;
    }

    const record = element as CanvasElement & Record<string, unknown>;

    return (
        record.editableText === true ||
        record.textEditable === true ||
        typeof record.text === 'string' ||
        typeof record.content === 'string' ||
        (typeof record.label === 'string' && record.label.trim() !== '')
    );
}

export function isElementLocked(element: CanvasElement | null | undefined): boolean {
    if (!element || typeof element !== 'object') {
        return false;
    }

    return (element as Record<string, unknown>).locked === true;
}

export function updateCanvasElement(
    canvas: Canvas,
    elementId: string,
    updater: (element: CanvasElement) => CanvasElement,
): Canvas {
    return {
        ...canvas,
        elements: canvas.elements.map((element) => (element.id === elementId ? updater(element) : element)),
    };
}

export function patchCanvasElement(canvas: Canvas, elementId: string, patch: ElementPatch): Canvas {
    return updateCanvasElement(canvas, elementId, (element) => clampElementToCanvas({ ...element, ...patch }, canvas));
}

export function patchElementStyle(canvas: Canvas, elementId: string, stylePatch: Record<string, unknown>): Canvas {
    return updateCanvasElement(canvas, elementId, (element) => {
        const currentStyle = isRecord((element as Record<string, unknown>).style)
            ? ((element as Record<string, unknown>).style as Record<string, unknown>)
            : {};

        return {
            ...element,
            style: {
                ...currentStyle,
                ...stylePatch,
            },
        };
    });
}

export function clampElementToCanvas(element: CanvasElement, canvas: Canvas): CanvasElement {
    const maxWidth = canvas.artboard.width * MAX_ELEMENT_MULTIPLIER;
    const maxHeight = canvas.artboard.height * MAX_ELEMENT_MULTIPLIER;
    const minWidth = minimumWidthForElement(element);
    const minHeight = minimumHeightForElement(element);
    const w = clampNumber(element.w, minWidth, maxWidth, minWidth);
    const h = clampNumber(element.h, minHeight, maxHeight, minHeight);
    const outsideX = canvas.artboard.width * OUTSIDE_ARTBOARD_RATIO;
    const outsideY = canvas.artboard.height * OUTSIDE_ARTBOARD_RATIO;

    return {
        ...element,
        x: clampNumber(element.x, -outsideX, canvas.artboard.width + outsideX - w, 0),
        y: clampNumber(element.y, -outsideY, canvas.artboard.height + outsideY - h, 0),
        w,
        h,
        rotation: normalizeRotation(element.rotation),
        z: finiteNumber(element.z, 0),
    };
}

export function normalizeRotation(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    let rotation = value % 360;

    if (rotation > 180) {
        rotation -= 360;
    }

    if (rotation <= -180) {
        rotation += 360;
    }

    return roundNumber(rotation);
}

export function canvasPointFromEvent(
    event: PointerEvent | ReactPointerEvent,
    artboardElement: HTMLElement,
    canvas: Canvas,
): { x: number; y: number } {
    const rect = artboardElement.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 1;
    const height = rect.height > 0 ? rect.height : 1;

    return {
        x: ((event.clientX - rect.left) / width) * canvas.artboard.width,
        y: ((event.clientY - rect.top) / height) * canvas.artboard.height,
    };
}

export function elementCenter(element: CanvasElement): { x: number; y: number } {
    return {
        x: element.x + element.w / 2,
        y: element.y + element.h / 2,
    };
}

export function elementLabel(element: CanvasElement): string {
    const record = element as CanvasElement & Record<string, unknown>;

    if (element.type === 'text') {
        const text = typeof record.text === 'string' ? record.text : typeof record.content === 'string' ? record.content : '';

        return text.trim() !== '' ? truncateLabel(text.trim()) : 'Texto';
    }

    if (element.type === 'image') {
        return typeof record.alt === 'string' && record.alt.trim() !== '' ? truncateLabel(record.alt.trim()) : 'Imagem';
    }

    if (element.type === 'sticker') {
        const text = textValueForElement(element);

        return text.trim() !== '' ? truncateLabel(text.trim()) : 'Sticker';
    }

    return element.type;
}

export function textFieldForElement(element: CanvasElement): 'text' | 'content' {
    const record = element as CanvasElement & Record<string, unknown>;

    if (element.type === 'sticker') {
        return typeof record.content === 'string' && typeof record.text !== 'string' ? 'content' : 'text';
    }

    return typeof record.content === 'string' && typeof record.text !== 'string' ? 'content' : 'text';
}

export function textValueForElement(element: CanvasElement): string {
    const field = textFieldForElement(element);
    const value = (element as CanvasElement & Record<string, unknown>)[field];

    if (typeof value === 'string') {
        return value;
    }

    if (element.type === 'sticker') {
        const label = (element as CanvasElement & Record<string, unknown>).label;

        return typeof label === 'string' ? label : '';
    }

    return '';
}

export function styleNumber(element: CanvasElement, key: string): number | null {
    const record = element as CanvasElement & Record<string, unknown>;

    if (!isRecord(record.style)) {
        return null;
    }

    const value = record.style[key];

    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function styleString(element: CanvasElement, key: string): string | null {
    const record = element as CanvasElement & Record<string, unknown>;

    if (!isRecord(record.style)) {
        return null;
    }

    const value = record.style[key];

    return typeof value === 'string' ? value : null;
}

export function minimumWidthForElement(element: CanvasElement): number {
    if (element.type === 'text') {
        return 72;
    }

    if (element.type === 'image') {
        return 72;
    }

    return MIN_ELEMENT_WIDTH;
}

export function minimumHeightForElement(element: CanvasElement): number {
    if (element.type === 'text') {
        return 36;
    }

    if (element.type === 'image') {
        return 72;
    }

    return MIN_ELEMENT_HEIGHT;
}

export function roundNumber(value: number): number {
    return Math.round(value * 100) / 100;
}

export function finiteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
    const number = finiteNumber(value, fallback);

    return roundNumber(Math.min(Math.max(number, min), max));
}

function truncateLabel(value: string): string {
    return value.length > 32 ? `${value.slice(0, 29)}...` : value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
