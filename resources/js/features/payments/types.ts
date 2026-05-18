export type PublicationCheck = {
    key: string;
    label: string;
    passed: boolean;
    severity: 'error' | 'warning';
    message?: string;
};

export type CheckoutGiftSummary = {
    id: string;
    title: string;
    status: string;
    recipient_name: string | null;
    sender_name: string | null;
    page_count: number;
    visible_page_count: number;
    media_count: number;
    urls: {
        dashboard: string;
        edit: string;
        preview: string;
        review: string;
    };
};

export type CheckoutPlanSummary = {
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    currency: string;
    max_pages: number | null;
    max_photos: number | null;
    gift_lifetime_days: number | null;
};

export type CheckoutOrderSummary = {
    id: string;
    status: string;
    amount_cents: number;
    currency: string;
    provider: string | null;
    paid_at: string | null;
    expires_at: string | null;
    payment_status: string;
    url: string;
};

export type OrderShowData = {
    id: string;
    status: string;
    amount_cents: number;
    currency: string;
    provider: string | null;
    paid_at: string | null;
    expires_at: string | null;
    payment_status: string;
    payment_processed_at: string | null;
    gift: {
        id: string;
        title: string;
        status: string;
        public_url: string | null;
        urls: {
            dashboard: string;
            edit: string;
            preview: string;
            review: string;
            checkout: string;
            public: string | null;
            share: string | null;
            qr_code: string | null;
            qr_code_download: string | null;
            share_card: string | null;
        };
    } | null;
    plan: {
        id: string;
        name: string;
        description: string | null;
        price_cents: number;
        currency: string;
        gift_lifetime_days: number | null;
    } | null;
    urls: {
        self: string;
        dev_approve: string;
    };
};
