import { ExternalLink, Printer } from 'lucide-react';

import { PrintableShareCard } from './PrintableShareCard';
import type { ShareCardData } from './shareTypes';

type GiftShareCardProps = {
    card: ShareCardData;
    cardUrl: string;
    printUrl: string;
    qrCodeUrl: string;
};

export function GiftShareCard({ card, cardUrl, printUrl, qrCodeUrl }: GiftShareCardProps) {
    return (
        <section
            className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 460px 460px',
            }}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Cartão</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-[#181024]">
                        Versão para imprimir ou enviar
                    </h2>
                </div>
            </div>

            <div className="mt-5">
                <PrintableShareCard card={card} qrCodeUrl={qrCodeUrl} />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                    href={printUrl}
                >
                    <Printer aria-hidden="true" className="h-4 w-4" />
                    Imprimir cartão
                </a>
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                    href={cardUrl}
                >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    Abrir cartão
                </a>
            </div>
        </section>
    );
}
