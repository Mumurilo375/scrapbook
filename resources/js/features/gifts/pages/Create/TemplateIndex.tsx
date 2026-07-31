import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gift } from 'lucide-react';

import { TemplateCard } from '../../components/TemplateCard';
import type { OccasionSummary, TemplateSummary } from '../../types';

type TemplateIndexProps = {
    occasion: OccasionSummary;
    templates: TemplateSummary[];
};

export default function TemplateIndex({ occasion, templates }: TemplateIndexProps) {
    return (
        <>
            <Head title={`Templates para ${occasion.name}`} />
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
                            className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] px-3 text-sm font-bold text-white hover:bg-[#281D36]"
                            href="/criar"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Ocasiões
                        </Link>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="max-w-3xl border-b border-[#A98BC4] pb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">
                            Templates publicados
                        </p>
                        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-5xl">
                            {occasion.name}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#514A59]">
                            {occasion.description ?? 'Escolha um modelo ativo para criar seu scrapbook.'}
                        </p>
                    </div>

                    {templates.length > 0 ? (
                        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                            {templates.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 border border-[#C9BAD8] bg-[#FBF7ED] p-6 text-[#6F6877] shadow-[0_8px_0_#CFC1AE]">
                            Ainda não existem templates publicados para esta ocasião.
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
