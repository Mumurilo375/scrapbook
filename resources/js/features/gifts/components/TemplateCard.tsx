import { Link } from '@inertiajs/react';
import { ArrowRight, FileText, Layers } from 'lucide-react';

import type { TemplateSummary } from '../types';

type TemplateCardProps = {
    template: TemplateSummary;
};

export function TemplateCard({ template }: TemplateCardProps) {
    return (
        <Link
            className="group relative block rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-4 shadow-[0_10px_0_#CFC1AE,0_20px_38px_#18102418] transition hover:-translate-y-1 hover:shadow-[0_13px_0_#CFC1AE,0_25px_44px_#18102424] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#FF705F] motion-reduce:transform-none"
            href={template.url}
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                backgroundPosition: 'center',
                backgroundSize: 'auto, 420px 420px',
            }}
        >
            <div className="relative aspect-[2/1] rounded-[8px] border border-[#291B2B] bg-[#43283D] p-2 shadow-[0_12px_22px_#1810242B]">
                <div className="grid h-full grid-cols-2 overflow-hidden rounded-[5px] border border-[#CFC1AE] bg-[#FBF7ED]">
                    <div className="relative border-r border-[#CFC1AE] bg-[#FBF7ED] p-3 shadow-[inset_-12px_0_20px_#43283D16]">
                        <span className="block h-2 w-2/3 bg-[#FF705F]/65" />
                        <span className="mt-3 block h-5 w-4/5 bg-[#D6CFDD]" />
                        <span className="mt-2 block h-1 w-3/4 bg-[#A98BC4]" />
                        <span className="absolute bottom-3 right-3 grid h-9 w-10 place-items-center border border-[#C9BAD8] bg-white text-[#D95045] shadow-sm">
                            <FileText aria-hidden="true" className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="relative bg-[#FBF7ED] p-3 shadow-[inset_12px_0_20px_#43283D16]">
                        <span className="block h-8 w-full bg-[#D8CCE5]" />
                        <span className="mt-3 block h-1 w-4/5 bg-[#C9BAD8]" />
                        <span className="mt-2 block h-1 w-2/3 bg-[#C9BAD8]" />
                    </div>
                </div>
                <span className="absolute bottom-2 left-1/2 top-2 w-4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#43283D]/25 to-transparent" />
                <span className="absolute left-1/2 top-[27%] h-2 w-4 -translate-x-1/2 rotate-90 rounded-full border border-[#9D846C]" />
                <span className="absolute bottom-[27%] left-1/2 h-2 w-4 -translate-x-1/2 rotate-90 rounded-full border border-[#9D846C]" />
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#A98BC4] bg-[#EFE9F3] text-[#D95045]">
                    <FileText aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#A98BC4] bg-[#F3EFF6] px-3 py-1 text-xs font-bold text-[#4B3D59]">
                    <Layers aria-hidden="true" className="h-3.5 w-3.5" />
                    {template.page_count} páginas
                </span>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold tracking-[-0.02em] text-[#181024]">{template.name}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#6F6877]">
                {template.description ?? 'Template publicado pronto para gerar um scrapbook editável.'}
            </p>
            {template.theme && (
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#D95045]">
                    Tema sugerido: {template.theme.name}
                </p>
            )}
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#D95045]">
                Usar este template
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}
