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
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Cartão</p>
                    <h2 className="mt-2 text-xl font-semibold text-[#1F150A]">Versão para imprimir ou enviar</h2>
                </div>
            </div>

            <div className="mt-5">
                <PrintableShareCard card={card} qrCodeUrl={qrCodeUrl} />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                    href={printUrl}
                >
                    <Printer aria-hidden="true" className="h-4 w-4" />
                    Imprimir cartão
                </a>
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                    href={cardUrl}
                >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    Abrir cartão
                </a>
            </div>
        </section>
    );
}
