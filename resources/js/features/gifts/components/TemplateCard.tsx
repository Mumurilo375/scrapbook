import { Link } from '@inertiajs/react';
import { ArrowRight, FileText, Layers } from 'lucide-react';

import type { TemplateSummary } from '../types';

type TemplateCardProps = {
    template: TemplateSummary;
};

export function TemplateCard({ template }: TemplateCardProps) {
    return (
        <Link
            className="paper-texture group block rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-5 shadow-[0_14px_34px_rgba(58,36,24,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(58,36,24,0.13)]"
            href={template.url}
        >
            <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[7px] border border-[#d8b98e] bg-[#f4e2c6] text-[#8E2F2F]">
                    <FileText aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#caa77d] bg-[#f3dfbd] px-3 py-1 text-xs font-semibold text-[#6F4E37]">
                    <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                    {template.page_count} páginas
                </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#3A2418]">{template.name}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#6F4E37]">
                {template.description ?? 'Template publicado pronto para gerar um scrapbook editável.'}
            </p>
            {template.theme && (
                <p className="mt-4 text-xs font-semibold uppercase text-[#8E2F2F]">
                    Tema sugerido: {template.theme.name}
                </p>
            )}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8E2F2F]">
                Usar este template
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}
