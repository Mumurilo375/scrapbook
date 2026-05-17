import { Link } from '@inertiajs/react';
import { ArrowRight, Tag } from 'lucide-react';

import type { OccasionSummary } from '../types';

type OccasionCardProps = {
    occasion: OccasionSummary;
};

export function OccasionCard({ occasion }: OccasionCardProps) {
    return (
        <Link
            className="paper-texture group block rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-5 shadow-[0_14px_34px_rgba(58,36,24,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(58,36,24,0.13)]"
            href={occasion.url ?? `/criar/${occasion.slug}`}
        >
            <span className="flex h-11 w-11 items-center justify-center rounded-[7px] border border-[#d8b98e] bg-[#f4e2c6] text-[#8E2F2F]">
                <Tag aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-[#3A2418]">{occasion.name}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-[#6F4E37]">
                {occasion.description ?? 'Escolha modelos prontos para transformar essa data em um scrapbook.'}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8E2F2F]">
                Escolher ocasião
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}
