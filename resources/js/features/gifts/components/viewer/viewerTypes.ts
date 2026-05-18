import type { Canvas } from '../../../../domain/canvas/schema';

export type ViewerPage = {
    id: string;
    name: string;
    page_type: string;
    sort_order: number;
    canvas: Canvas | Record<string, unknown>;
};

export type ViewerGift = {
    id: string | null;
    title: string;
    recipient_name: string | null;
    sender_name: string | null;
    status: string;
    published_at: string | null;
    expires_at: string | null;
    theme: {
        name: string;
    } | null;
    pages: ViewerPage[];
    urls: {
        edit: string | null;
        preview: string | null;
        public: string | null;
        create: string;
    };
};

export type NormalizedViewerPage = ViewerPage & {
    canvas: Canvas;
};
