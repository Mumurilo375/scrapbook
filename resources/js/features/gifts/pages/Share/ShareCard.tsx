import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, Printer } from 'lucide-react';
import { useEffect } from 'react';

import { PrintableShareCard } from '../../components/share/PrintableShareCard';
import type { ShareCardData } from '../../components/share/shareTypes';

type ShareCardGift = {
    id: string;
    status: string;
    title: string;
    urls: {
        dashboard: string;
        share: string;
    };
};

type ShareCardPayload = ShareCardData & {
    qr_code_url: string;
};

type ShareCardProps = {
    autoPrint: boolean;
    card: ShareCardPayload;
    gift: ShareCardGift;
};

export default function ShareCard({ autoPrint, card, gift }: ShareCardProps) {
    useEffect(() => {
        if (!autoPrint) {
            return;
        }

        const timer = window.setTimeout(() => window.print(), 350);

        return () => window.clearTimeout(timer);
    }, [autoPrint]);

    return (
        <>
            <Head title={`Cartão de ${gift.title}`} />
            <main className="share-card-print-page min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="share-card-screen-only border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                                href={gift.urls.share}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Compartilhar
                            </Link>
                            <button
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                onClick={() => window.print()}
                                type="button"
                            >
                                <Printer aria-hidden="true" className="h-4 w-4" />
                                Imprimir/Salvar PDF
                            </button>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-5xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
                    <PrintableShareCard card={card} className="share-card-print-target" qrCodeUrl={card.qr_code_url} />
                </section>
            </main>
        </>
    );
}
