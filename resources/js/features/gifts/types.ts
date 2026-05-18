import type { Canvas } from '../../domain/canvas/schema';

export type OccasionSummary = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order?: number;
    url?: string;
};

export type ThemeSummary = {
    id: string;
    name: string;
    theme: {
        id: string;
        name: string;
        slug?: string;
    } | null;
};

export type TemplateVersionSummary = {
    id: string;
    name: string;
    version_number: number;
    preview_config: Record<string, unknown> | null;
    page_count: number;
    pages: Array<{
        id: string;
        name: string;
        page_type: string;
        sort_order: number;
    }>;
};

export type TemplateSummary = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    preview_config: Record<string, unknown> | null;
    page_count: number;
    template_version: TemplateVersionSummary;
    theme: ThemeSummary | null;
    url: string;
};

export type PlanSummary = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price_cents: number;
    currency: string;
    max_pages: number | null;
    max_photos: number | null;
};

export type GiftSummary = {
    id: string;
    title: string;
    status: string;
    updated_at: string | null;
    last_edited_at: string | null;
    published_at?: string | null;
    expires_at?: string | null;
    occasion: {
        name: string;
        slug: string;
    } | null;
    template: {
        name: string;
        slug: string;
    } | null;
    edit_url: string;
    preview_url: string;
    review_url: string;
    checkout_url: string;
    order_url: string | null;
    public_url: string | null;
};

export type EditableGift = {
    id: string;
    title: string;
    status: string;
    recipient_name: string | null;
    sender_name: string | null;
    last_edited_at: string | null;
    occasion: {
        id: string;
        name: string;
        slug: string;
    } | null;
    template: {
        id: string;
        name: string;
        slug: string;
    } | null;
    theme: {
        id: string;
        name: string;
    } | null;
    update_url: string;
    preview_url: string;
    review_url: string;
    checkout_url: string;
    order_url: string | null;
    public_url: string | null;
    media_index_url: string;
    media_store_url: string;
    dashboard_url: string;
};

export type GiftPageSummary = {
    id: string;
    name: string;
    page_type: string;
    sort_order: number;
    canvas: Record<string, unknown> | Canvas;
    is_visible: boolean;
    locked: boolean;
    text_max_length: number;
    update_url: string;
};
