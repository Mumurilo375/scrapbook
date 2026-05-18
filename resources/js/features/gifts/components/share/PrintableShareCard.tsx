import type { CSSProperties } from 'react';

import type { ShareCardData } from './shareTypes';

type PrintableShareCardProps = {
    card: ShareCardData;
    className?: string;
    qrCodeUrl: string;
};

export function PrintableShareCard({ card, className = '', qrCodeUrl }: PrintableShareCardProps) {
    const palette = card.palette;

    return (
        <article
            className={`share-card-print-sheet relative isolate mx-auto aspect-[5/7] w-full max-w-[420px] overflow-hidden rounded-[8px] border p-7 shadow-xl ${className}`}
            style={
                {
                    '--card-accent': palette.accent,
                    '--card-ink': palette.ink,
                    '--card-muted': palette.muted_ink,
                    '--card-paper': palette.paper,
                    '--card-paper-alt': palette.paper_alt,
                    '--card-shadow': palette.shadow,
                    backgroundColor: palette.paper,
                    borderColor: palette.accent_soft,
                    color: palette.ink,
                    boxShadow: `0 24px 50px ${palette.shadow}`,
                } as CSSProperties
            }
        >
            <div className="paper-grain pointer-events-none absolute inset-0 -z-10 opacity-75" />
            <div
                className="pointer-events-none absolute -left-8 top-6 h-8 w-32 -rotate-12 opacity-80"
                style={{ backgroundColor: palette.tape }}
            />
            <div
                className="pointer-events-none absolute -right-8 bottom-16 h-8 w-32 -rotate-12 opacity-70"
                style={{ backgroundColor: palette.accent_soft }}
            />
            <div
                className="pointer-events-none absolute left-7 right-7 top-7 -z-10 h-24 rounded-full opacity-30 blur-2xl"
                style={{ backgroundColor: palette.accent_soft }}
            />

            <div className="flex h-full flex-col items-center justify-between gap-5 text-center">
                <div className="grid gap-2">
                    <p className="font-editorial text-xs font-semibold uppercase" style={{ color: palette.accent }}>
                        Scrapbook digital
                    </p>
                    <h1 className="font-editorial text-3xl font-semibold leading-tight sm:text-4xl">{card.title}</h1>
                    <p className="text-sm font-semibold" style={{ color: palette.muted_ink }}>
                        {card.recipient_name ? `Para ${card.recipient_name}` : 'Feito com carinho'}
                        {card.sender_name ? `, de ${card.sender_name}` : ''}
                    </p>
                </div>

                <div className="grid justify-items-center gap-4">
                    <div
                        className="rounded-[8px] border bg-white p-4 shadow-md"
                        style={{ borderColor: palette.accent_soft }}
                    >
                        <img alt="QR Code do presente" className="h-44 w-44" src={qrCodeUrl} />
                    </div>
                    <p className="font-hand text-3xl leading-none" style={{ color: palette.accent }}>
                        {card.instruction}
                    </p>
                </div>

                <div className="grid gap-2">
                    <p className="break-all text-xs font-semibold" style={{ color: palette.muted_ink }}>
                        {card.visible_url}
                    </p>
                    <div className="mx-auto flex items-center gap-2 text-xs font-semibold" style={{ color: palette.leaf }}>
                        <span className="h-px w-8" style={{ backgroundColor: palette.leaf }} />
                        <span>feito para guardar</span>
                        <span className="h-px w-8" style={{ backgroundColor: palette.leaf }} />
                    </div>
                </div>
            </div>
        </article>
    );
}
