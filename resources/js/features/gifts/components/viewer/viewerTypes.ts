import type { Canvas } from '../../../../domain/canvas/schema';
import type { RendererAsset } from '../../../../components/renderer';

export type ViewerPage = {
    id: string;
    name: string;
    page_type: string;
    sort_order: number;
    canvas: Canvas | Record<string, unknown>;
};

export type ViewerGift = {
    analytics?: {
        enabled: boolean;
        event_url: string;
        visit_uuid: string | null;
    };
    id?: string;
    title: string;
    recipient_name: string | null;
    sender_name: string | null;
    status?: string;
    published_at?: string | null;
    expires_at?: string | null;
    theme: {
        name: string;
        config: Record<string, unknown>;
    } | null;
    pages: ViewerPage[];
    assets?: RendererAsset[];
    urls: {
        edit?: string | null;
        preview?: string | null;
        review?: string | null;
        share?: string | null;
        public?: string | null;
        create: string;
    };
};

export type NormalizedViewerPage = ViewerPage & {
    canvas: Canvas;
};
