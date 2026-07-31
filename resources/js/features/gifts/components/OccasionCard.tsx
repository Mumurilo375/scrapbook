import { Link } from '@inertiajs/react';
import { ArrowRight, Tag } from 'lucide-react';

import type { OccasionSummary } from '../types';

type OccasionCardProps = {
    occasion: OccasionSummary;
};

export function OccasionCard({ occasion }: OccasionCardProps) {
    return (
        <Link
            className="group relative isolate block min-h-72 overflow-hidden rounded-[12px_8px_8px_12px] border border-[#291B2B] bg-[#43283D] p-5 text-white shadow-[8px_10px_0_#CFC1AE,0_22px_42px_#18102424] transition hover:-translate-y-1 hover:rotate-[0.35deg] hover:shadow-[8px_13px_0_#CFC1AE,0_28px_48px_#18102430] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#FF705F] motion-reduce:transform-none"
            href={occasion.url ?? `/criar/${occasion.slug}`}
            style={{
                backgroundImage:
                    "linear-gradient(105deg,rgba(255,255,255,.08),transparent 30%,rgba(0,0,0,.12)),url('/materials/bookcloth-aubergine.webp')",
                backgroundPosition: 'center',
                backgroundSize: 'auto, 520px 520px',
            }}
        >
            <span aria-hidden="true" className="absolute bottom-0 left-4 top-0 w-px bg-[#675578]" />
            <span aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-px bg-[#3A2A48]" />
            <span className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                <Tag aria-hidden="true" className="h-5 w-5" />
            </span>
            <div
                className="relative mt-7 border border-[#D4C7B5] bg-[#FBF7ED] px-4 py-5 text-[#292331] shadow-[3px_5px_0_#CFC1AE]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(251,247,237,.86),rgba(251,247,237,.86)),url('/materials/cotton-paper.webp')",
                    backgroundSize: 'auto, 360px 360px',
                }}
            >
                <span className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-2 bg-[#C9A779]/78 shadow-sm" />
                <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[#181024]">{occasion.name}</h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-[#6F6877]">
                    {occasion.description ?? 'Escolha modelos prontos para transformar essa data em um scrapbook.'}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#D95045]">
                    Escolher ocasião
                    <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
            </div>
        </Link>
    );
}
