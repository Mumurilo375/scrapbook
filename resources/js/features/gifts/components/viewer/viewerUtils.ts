import { canvasSchema, type Canvas } from '../../../../domain/canvas/schema';
import type { NormalizedViewerPage, ViewerPage } from './viewerTypes';

const DEFAULT_ARTBOARD = {
    width: 390,
    height: 844,
    safeArea: { top: 24, right: 16, bottom: 24, left: 16 },
};

export function normalizeViewerPages(pages: ViewerPage[]): NormalizedViewerPage[] {
    return pages.map((page) => ({
        ...page,
        canvas: normalizeCanvas(page.canvas),
    }));
}

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
        elements: elements.filter(isRecord).map((element, index) => ({
            ...element,
            id: typeof element.id === 'string' && element.id !== '' ? element.id : `element_${index + 1}`,
            type: typeof element.type === 'string' && element.type !== '' ? element.type : 'unknown',
            x: numberValue(element.x, 0),
            y: numberValue(element.y, 0),
            w: positiveNumber(element.w, 120),
            h: positiveNumber(element.h, 40),
            rotation: numberValue(element.rotation, 0),
            z: numberValue(element.z, index),
        })),
    };
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
