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
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#E5D0B8] bg-[#F4E8D9]/92">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-4 text-sm font-semibold text-[#42291D] hover:bg-white"
                            href="/app/gifts"
                        >
                            <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
                            Meus gifts
                        </Link>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Escolha a ocasião</p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#1F150A] sm:text-5xl">
                            Comece pelo motivo do presente.
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-[#42291D]">
                            Cada ocasião mostra templates publicados no banco, prontos para gerar um rascunho editável.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {occasions.map((occasion) => (
                            <OccasionCard key={occasion.id} occasion={occasion} />
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}
