import type { EditorAsset } from './editorTypes';

const PAGE_BACKGROUND_ROLES = new Set(['paper_texture', 'kraft_surface', 'page_background']);
const NON_STICKER_ROLES = new Set([
    'paper_texture',
    'background_texture',
    'book_texture',
    'spine_texture',
    'page_overlay',
    'edge_overlay',
    'fabric_background',
    'kraft_surface',
    'page_background',
    'aging_overlay',
    'stain_overlay',
]);

export function isPageBackgroundAsset(asset: EditorAsset): boolean {
    if (asset.role && PAGE_BACKGROUND_ROLES.has(asset.role)) {
        return true;
    }

    if (asset.type === 'paper' || asset.type === 'texture') {
        return true;
    }

    return asset.type === 'background' && isMarkedForPageBackground(asset);
}

export function isDecorativeAsset(asset: EditorAsset): boolean {
    if (isPageBackgroundAsset(asset)) {
        return false;
    }

    if (asset.role && NON_STICKER_ROLES.has(asset.role)) {
        return false;
    }

    return asset.type !== 'paper' && asset.type !== 'texture' && asset.type !== 'background';
}

function isMarkedForPageBackground(asset: EditorAsset): boolean {
    const editor = isRecord(asset.config?.editor) ? asset.config.editor : {};
    const usage = isRecord(asset.config?.usage) ? asset.config.usage : {};

    return [asset.config?.pageBackground, asset.config?.page_background, editor.pageBackground, editor.page_background, usage.pageBackground, usage.page_background].some(
        (value) => value === true || value === 'page_background' || value === 'paper',
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
