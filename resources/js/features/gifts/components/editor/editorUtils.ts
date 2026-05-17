import { canvasSchema, type Canvas } from '../../../../domain/canvas/schema';
import type { CanvasElementRecord, EditableImageElement, EditableTextElement, EditorMediaItem } from './editorTypes';

const DEFAULT_ARTBOARD = {
    width: 390,
    height: 844,
    safeArea: { top: 24, right: 16, bottom: 24, left: 16 },
};

export function normalizeCanvas(rawCanvas: unknown): Canvas {
    const canvasRecord = isRecord(rawCanvas) ? rawCanvas : {};
    const parsed = canvasSchema.safeParse(canvasRecord);

    if (parsed.success) {
        return parsed.data;
    }

    const artboard = isRecord(canvasRecord.artboard) ? canvasRecord.artboard : {};
    const elements = Array.isArray(canvasRecord.elements) ? canvasRecord.elements : [];

    return {
        schemaVersion: 1,
        artboard: {
            width: positiveNumber(artboard.width, DEFAULT_ARTBOARD.width),
            height: positiveNumber(artboard.height, DEFAULT_ARTBOARD.height),
            safeArea: isRecord(artboard.safeArea)
                ? {
                      top: nonNegativeNumber(artboard.safeArea.top, DEFAULT_ARTBOARD.safeArea.top),
                      right: nonNegativeNumber(artboard.safeArea.right, DEFAULT_ARTBOARD.safeArea.right),
                      bottom: nonNegativeNumber(artboard.safeArea.bottom, DEFAULT_ARTBOARD.safeArea.bottom),
                      left: nonNegativeNumber(artboard.safeArea.left, DEFAULT_ARTBOARD.safeArea.left),
                  }
                : DEFAULT_ARTBOARD.safeArea,
        },
        background: isRecord(canvasRecord.background) ? canvasRecord.background : undefined,
        elements: elements.filter(isRecord).map((element, index) => {
            const normalized = {
                ...element,
                id: typeof element.id === 'string' && element.id !== '' ? element.id : `element_${index + 1}`,
                type: typeof element.type === 'string' && element.type !== '' ? element.type : 'unknown',
                x: numberValue(element.x, 0),
                y: numberValue(element.y, 0),
                w: positiveNumber(element.w, 120),
                h: positiveNumber(element.h, 40),
                rotation: numberValue(element.rotation, 0),
                z: numberValue(element.z, index),
            };

            return normalized;
        }),
    };
}

export function cloneCanvas(canvas: Canvas): Canvas {
    return JSON.parse(JSON.stringify(canvas)) as Canvas;
}

export function canvasesAreEqual(left: Canvas, right: Canvas): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

export function textElementsFromCanvas(canvas: Canvas, maxLength: number): EditableTextElement[] {
    return canvas.elements
        .filter((element) => element.type === 'text')
        .map((element) => {
            const record = element as CanvasElementRecord;
            const field = typeof record.text === 'string' || typeof record.content !== 'string' ? 'text' : 'content';
            const value = typeof record[field] === 'string' ? record[field] : '';

            return {
                id: element.id,
                field,
                value,
                maxLength,
                label: textElementLabel(record),
            };
        });
}

export function updateCanvasText(canvas: Canvas, elementId: string, field: 'text' | 'content', value: string): Canvas {
    return {
        ...canvas,
        elements: canvas.elements.map((element) => {
            if (element.id !== elementId) {
                return element;
            }

            return {
                ...element,
                [field]: value,
            };
        }),
    };
}

export function imageElementsFromCanvas(canvas: Canvas): EditableImageElement[] {
    return canvas.elements
        .filter((element) => element.type === 'image')
        .map((element) => {
            const record = element as CanvasElementRecord;
            const mediaItemId = typeof record.mediaItemId === 'string'
                ? record.mediaItemId
                : typeof record.media_item_id === 'string'
                  ? record.media_item_id
                  : null;

            return {
                id: element.id,
                mediaItemId,
                label: imageElementLabel(record),
            };
        });
}

export function applyMediaToImageElement(canvas: Canvas, elementId: string, mediaItem: EditorMediaItem): Canvas {
    return {
        ...canvas,
        elements: canvas.elements.map((element) => {
            if (element.id !== elementId || element.type !== 'image') {
                return element;
            }

            const record = { ...element } as CanvasElementRecord;
            delete record.media_item_id;

            return {
                ...record,
                mediaItemId: mediaItem.id,
                src: mediaItem.url,
            };
        }),
    };
}

function textElementLabel(element: CanvasElementRecord): string {
    if (typeof element.slotKey === 'string' && element.slotKey !== '') {
        return element.slotKey.replaceAll('_', ' ');
    }

    return element.id;
}

function imageElementLabel(element: CanvasElementRecord): string {
    if (typeof element.slotKey === 'string' && element.slotKey !== '') {
        return element.slotKey.replaceAll('_', ' ');
    }

    if (typeof element.alt === 'string' && element.alt !== '') {
        return element.alt;
    }

    return element.id;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function positiveNumber(value: unknown, fallback: number): number {
    const number = numberValue(value, fallback);

    return number > 0 ? number : fallback;
}

function nonNegativeNumber(value: unknown, fallback: number): number {
    const number = numberValue(value, fallback);

    return number >= 0 ? number : fallback;
}
