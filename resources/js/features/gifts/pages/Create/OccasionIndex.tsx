import { Head, Link } from '@inertiajs/react';
import { Gift, LayoutDashboard } from 'lucide-react';

import { OccasionCard } from '../../components/OccasionCard';
import type { OccasionSummary } from '../../types';

type OccasionIndexProps = {
    occasions: OccasionSummary[];
};

export default function OccasionIndex({ occasions }: OccasionIndexProps) {
    return (
        <>
            <Head title="Criar presente" />
            <main
                className="min-h-screen bg-[#E5DDED] font-sans text-[#292331]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(75,61,89,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(75,61,89,.07) 1px,transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            >
                <header
                    className="border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-[#281D36] px-4 text-sm font-bold text-white hover:bg-[#3A2A48]"
                            href="/app/gifts"
                        >
                            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                            Meus gifts
                        </Link>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="max-w-3xl border-b border-[#A98BC4] pb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">
                            Escolha a ocasião
                        </p>
                        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-5xl">
                            Comece pelo motivo do presente.
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#514A59]">
                            Cada ocasião mostra templates publicados no banco, prontos para gerar um rascunho editável.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                        {occasions.map((occasion) => (
                            <OccasionCard key={occasion.id} occasion={occasion} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
