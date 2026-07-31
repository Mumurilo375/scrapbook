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
            className={`share-card-print-sheet relative isolate mx-auto aspect-[5/7] w-full max-w-[420px] overflow-hidden rounded-[4px] border p-7 shadow-[0_10px_0_#CFC1AE,0_24px_46px_#1810242D] [clip-path:polygon(.8%_0,99%_.5%,100%_35%,99.3%_72%,100%_99.4%,0_100%)] ${className}`}
            style={
                {
                    '--card-accent': palette.accent,
                    '--card-ink': palette.ink,
                    '--card-muted': palette.muted_ink,
                    '--card-paper': palette.paper,
                    '--card-paper-alt': palette.paper_alt,
                    '--card-shadow': palette.shadow,
                    backgroundColor: palette.paper,
                    backgroundImage:
                        "linear-gradient(rgba(251,247,237,.52),rgba(251,247,237,.52)),url('/materials/cotton-paper.webp')",
                    backgroundPosition: 'center',
                    backgroundSize: 'auto, 520px 520px',
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
            <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-0 right-0 z-20 aspect-square w-16 bg-[linear-gradient(135deg,#CFC2B1_0_48%,#FFFDF7_50%_100%)] shadow-[-8px_-7px_18px_#3B261F29] [clip-path:polygon(0_0,100%_0,100%_100%)]"
            />

            <div className="flex h-full flex-col items-center justify-between gap-5 text-center">
                <div className="grid gap-2">
                    <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: palette.accent }}>
                        Scrapbook digital
                    </p>
                    <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl">
                        {card.title}
                    </h1>
                    <p className="text-sm font-semibold" style={{ color: palette.muted_ink }}>
                        {card.recipient_name ? `Para ${card.recipient_name}` : 'Feito com carinho'}
                        {card.sender_name ? `, de ${card.sender_name}` : ''}
                    </p>
                </div>

                <div className="grid justify-items-center gap-4">
                    <div
                        className="-rotate-1 border bg-white p-4 pb-7 shadow-[0_10px_20px_#18102424]"
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
                    <div
                        className="mx-auto flex items-center gap-2 text-xs font-semibold"
                        style={{ color: palette.leaf }}
                    >
                        <span className="h-px w-8" style={{ backgroundColor: palette.leaf }} />
                        <span>feito para guardar</span>
                        <span className="h-px w-8" style={{ backgroundColor: palette.leaf }} />
                    </div>
                </div>
            </div>
        </article>
    );
}
