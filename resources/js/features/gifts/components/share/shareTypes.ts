export type ShareCardPalette = {
    accent: string;
    accent_soft: string;
    background: string;
    ink: string;
    leaf: string;
    muted_ink: string;
    paper: string;
    paper_alt: string;
    shadow: string;
    tape: string;
};

export type ShareCardData = {
    instruction: string;
    palette: ShareCardPalette;
    public_url: string;
    recipient_name: string | null;
    sender_name: string | null;
    theme: {
        config: Record<string, unknown>;
        name: string | null;
    };
    title: string;
    visible_url: string;
};
