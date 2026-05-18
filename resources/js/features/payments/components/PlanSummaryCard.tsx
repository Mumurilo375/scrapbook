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
            <section className="rounded-[8px] border border-[#D93632] bg-[#F8D8D3] p-5 text-sm font-semibold text-[#8F211F] shadow-sm">
                Nenhum plano disponível agora.
            </section>
        );
    }

    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Plano</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#1F150A]">{plan.name}</h2>
                    {plan.description ? <p className="mt-2 text-sm text-[#6F5A4A]">{plan.description}</p> : null}
                </div>
                <div className="rounded-[8px] border border-[#7E8F68] bg-[#E7EBD8] px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase text-[#48573A]">Total</p>
                    <p className="mt-1 text-2xl font-semibold text-[#1F150A]">
                        {formatPrice(plan.price_cents, plan.currency)}
                    </p>
                </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm text-[#42291D] sm:grid-cols-3">
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

            <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#6F5A4A]">
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
        <div className="rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3">
            <div className="text-[#D93632]">{icon}</div>
            <dt className="mt-2 font-semibold text-[#1F150A]">{label}</dt>
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
