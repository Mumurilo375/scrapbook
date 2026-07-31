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
            <main className="share-card-print-page min-h-screen bg-[#E5DDED] font-sans text-[#292331]">
                <header
                    className="share-card-screen-only border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#D8CFDF] hover:text-white"
                                href={gift.urls.share}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Compartilhar
                            </Link>
                            <button
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
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
