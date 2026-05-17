import { Link } from '@inertiajs/react';
import { ArrowRight, FileText, Layers } from 'lucide-react';

import type { TemplateSummary } from '../types';

type TemplateCardProps = {
    template: TemplateSummary;
};

export function TemplateCard({ template }: TemplateCardProps) {
    return (
        <Link
            className="paper-texture group block rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-[0_14px_34px_#221C1914] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_#221C1921]"
            href={template.url}
        >
            <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-[7px] border border-[#CBA980] bg-[#EAD2B8] text-[#D93632]">
                    <FileText aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#B78D5C] bg-[#E8CFB4] px-3 py-1 text-xs font-semibold text-[#42291D]">
                    <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                    {template.page_count} páginas
                </span>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-[#1F150A]">{template.name}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#42291D]">
                {template.description ?? 'Template publicado pronto para gerar um scrapbook editável.'}
            </p>
            {template.theme && (
                <p className="mt-4 text-xs font-semibold uppercase text-[#D93632]">
                    Tema sugerido: {template.theme.name}
                </p>
            )}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#D93632]">
                Usar este template
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}
