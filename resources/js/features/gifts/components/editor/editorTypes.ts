import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';

export type EditorSaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

export type EditableTextElement = {
    id: string;
    label: string;
    field: 'text' | 'content';
    value: string;
    maxLength: number;
};

export type EditableImageElement = {
    id: string;
    label: string;
    mediaItemId: string | null;
};

export type EditorMediaItem = {
    id: string;
    type: 'image';
    originalFilename: string | null;
    url: string;
    thumbnailUrl: string | null;
    width: number | null;
    height: number | null;
    sizeBytes: number;
    status: string;
    createdAt: string | null;
};

export type EditorPage = {
    id: string;
    name: string;
    page_type: string;
    sort_order: number;
    canvas: Canvas;
    is_visible: boolean;
    locked: boolean;
    text_max_length: number;
    update_url: string;
};

export type CanvasElementRecord = CanvasElement & Record<string, unknown>;
