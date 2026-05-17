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
            <main className="scrapbook-background min-h-screen bg-[#F7F1E8] text-[#1F1A17]">
                <header className="border-b border-[#ead8bf] bg-[#F7F1E8]/92">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#3A2418]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#caa77d] bg-[#FFF8EC] text-[#8E2F2F]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F4E37]" href="/criar">
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Ocasiões
                        </Link>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="font-editorial text-xs font-semibold uppercase text-[#8E2F2F]">Templates publicados</p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#3A2418] sm:text-5xl">
                            {occasion.name}
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-[#6F4E37]">
                            {occasion.description ?? 'Escolha um modelo ativo para criar seu scrapbook.'}
                        </p>
                    </div>

                    {templates.length > 0 ? (
                        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {templates.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10 rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-6 text-[#6F4E37]">
                            Ainda não existem templates publicados para esta ocasião.
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
