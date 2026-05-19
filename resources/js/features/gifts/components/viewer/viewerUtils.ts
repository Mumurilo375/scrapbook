import { canvasSchema, type Canvas } from '../../../../domain/canvas/schema';
import type { NormalizedViewerPage, ViewerPage } from './viewerTypes';

const DEFAULT_ARTBOARD = {
    width: 1080,
    height: 1350,
    safeArea: { top: 80, right: 80, bottom: 80, left: 80 },
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
        elements: elements.filter(isRecord).map((element, index) => ({
            ...element,
            id: typeof element.id === 'string' && element.id !== '' ? element.id : `element_${index + 1}`,
            type: typeof element.type === 'string' && element.type !== '' ? element.type : 'unknown',
            name: typeof element.name === 'string' && element.name.trim() !== '' ? element.name.trim() : undefined,
            x: numberValue(element.x, 0),
            y: numberValue(element.y, 0),
            w: positiveNumber(element.w ?? element.width, 120),
            h: positiveNumber(element.h ?? element.height, 40),
            rotation: numberValue(element.rotation, 0),
            z: numberValue(element.z ?? element.zIndex, index),
            locked: element.locked === true,
            hidden: element.hidden === true,
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
