import { canvasSchema, type Canvas } from '../../../../domain/canvas/schema';
import type { CanvasElementRecord, EditableImageElement, EditableTextElement, EditorMediaItem } from './editorTypes';
import { normalizeCanvasLayerOrder } from './layerUtils';

const DEFAULT_ARTBOARD = {
    width: 1080,
    height: 1350,
    safeArea: { top: 80, right: 80, bottom: 80, left: 80 },
};

export function normalizeCanvas(rawCanvas: unknown): Canvas {
    const canvasRecord = isRecord(rawCanvas) ? rawCanvas : {};
    const parsed = canvasSchema.safeParse(canvasRecord);

    if (parsed.success) {
        return normalizeCanvasLayerOrder(parsed.data);
    }

    const artboard = isRecord(canvasRecord.artboard) ? canvasRecord.artboard : {};
    const elements = Array.isArray(canvasRecord.elements) ? canvasRecord.elements : [];

    return normalizeCanvasLayerOrder({
        schemaVersion: 1,
        version: 1,
        artboard: {
            width: positiveNumber(artboard.width, DEFAULT_ARTBOARD.width),
            height: positiveNumber(artboard.height, DEFAULT_ARTBOARD.height),
            unit: 'px',
            background: normalizePageBackground(artboard.background),
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
                name: typeof element.name === 'string' && element.name.trim() !== '' ? element.name.trim() : undefined,
                x: numberValue(element.x, 0),
                y: numberValue(element.y, 0),
                w: positiveNumber(element.w ?? element.width, 120),
                h: positiveNumber(element.h ?? element.height, 40),
                rotation: numberValue(element.rotation, 0),
                z: numberValue(element.z ?? element.zIndex, (index + 1) * 10),
                locked: element.locked === true,
                hidden: element.hidden === true,
            };

            return normalized;
        }),
    });
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
    if (typeof element.name === 'string' && element.name.trim() !== '') {
        return element.name.trim();
    }

    const text = typeof element.text === 'string' ? element.text : typeof element.content === 'string' ? element.content : '';

    if (text.trim() !== '') {
        return `Texto: ${truncateLabel(text.trim(), 36)}`;
    }

    return 'Texto';
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

function normalizePageBackground(value: unknown): Canvas['artboard']['background'] {
    if (!isRecord(value) || value.type !== 'asset') {
        return { type: 'theme' };
    }

    const rawAssetId = value.assetId ?? value.asset_id;
    const assetId = typeof rawAssetId === 'string' || typeof rawAssetId === 'number' ? rawAssetId : null;

    if (assetId === null || String(assetId).trim() === '') {
        return { type: 'theme' };
    }

    return {
        type: 'asset',
        assetId,
        fit: value.fit === 'contain' ? 'contain' : 'cover',
        opacity: clampOpacity(value.opacity),
    };
}

function clampOpacity(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}

function truncateLabel(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 3))}...` : value;
}
