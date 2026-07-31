import { Clock, FileText, Image, Receipt } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatPrice } from '../../gifts/components/formatters';
import type { CheckoutPlanSummary } from '../types';

type PlanSummaryCardProps = {
    plan: CheckoutPlanSummary | null;
};

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
    if (!plan) {
        return (
            <section className="border border-[#FF705F] bg-[#FFF0ED] p-5 text-sm font-bold text-[#D95045] shadow-[4px_5px_0_#F3C7C1]">
                Nenhum plano disponível agora.
            </section>
        );
    }

    return (
        <section
            className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 460px 460px',
            }}
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Plano</p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-[#181024]">{plan.name}</h2>
                    {plan.description ? <p className="mt-2 text-sm text-[#6F6877]">{plan.description}</p> : null}
                </div>
                <div className="border border-dashed border-[#73A58E] bg-[#E8F2ED] px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase text-[#2E6856]">Total</p>
                    <p className="mt-1 text-2xl font-semibold text-[#181024]">
                        {formatPrice(plan.price_cents, plan.currency)}
                    </p>
                </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm text-[#6F6877] sm:grid-cols-3">
                <Info
                    icon={<FileText aria-hidden="true" className="h-4 w-4" />}
                    label="Páginas"
                    value={limit(plan.max_pages)}
                />
                <Info
                    icon={<Image aria-hidden="true" className="h-4 w-4" />}
                    label="Fotos"
                    value={limit(plan.max_photos)}
                />
                <Info
                    icon={<Clock aria-hidden="true" className="h-4 w-4" />}
                    label="Validade"
                    value={days(plan.gift_lifetime_days)}
                />
            </dl>

            <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#6F6877]">
                <Receipt aria-hidden="true" className="h-4 w-4" />O valor vem do plano escolhido e fica protegido pelo
                sistema.
            </p>
        </section>
    );
}

type InfoProps = {
    icon: ReactNode;
    label: string;
    value: string;
};

function Info({ icon, label, value }: InfoProps) {
    return (
        <div className="border-b border-[#D6CFDD] bg-white/65 px-3 py-3 last:border-b-0">
            <div className="text-[#FF705F]">{icon}</div>
            <dt className="mt-2 font-semibold text-[#181024]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
        </div>
    );
}

function limit(value: number | null): string {
    return value === null ? 'Sem limite' : `${value}`;
}

function days(value: number | null): string {
    return value === null ? 'Padrão do produto' : `${value} dias`;
}
