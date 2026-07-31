import { Eye, FileText, Image, PenLine } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { GiftStatusBadge } from '../../gifts/components/GiftStatusBadge';
import type { CheckoutGiftSummary } from '../types';

type CheckoutSummaryProps = {
    gift: CheckoutGiftSummary;
};

export function CheckoutSummary({ gift }: CheckoutSummaryProps) {
    return (
        <section
            className="relative overflow-hidden rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 460px 460px',
            }}
        >
            <span className="absolute right-8 top-0 h-6 w-20 -rotate-2 bg-[#C9A779]/75" />
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Presente</p>
                    <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-[#181024]">
                        {gift.title}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-[#6F6877]">
                        {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                        {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                    </p>
                </div>
                <GiftStatusBadge status={gift.status} />
            </div>

            <dl className="mt-5 grid gap-3 text-sm text-[#6F6877] sm:grid-cols-2">
                <Info
                    icon={<FileText aria-hidden="true" className="h-4 w-4" />}
                    label="Páginas visíveis"
                    value={`${gift.visible_page_count} de ${gift.page_count}`}
                />
                <Info
                    icon={<Image aria-hidden="true" className="h-4 w-4" />}
                    label="Fotos"
                    value={`${gift.media_count}`}
                />
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
                <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                    href={gift.urls.preview}
                >
                    <Eye aria-hidden="true" className="h-4 w-4" />
                    Pré-visualizar
                </Link>
                <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                    href={gift.urls.edit}
                >
                    <PenLine aria-hidden="true" className="h-4 w-4" />
                    Editar
                </Link>
            </div>
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
        <div className="flex items-center gap-3 border-b border-[#D6CFDD] bg-white/65 px-3 py-3 last:border-b-0">
            <span className="text-[#FF705F]">{icon}</span>
            <div>
                <dt className="font-semibold text-[#181024]">{label}</dt>
                <dd className="mt-0.5">{value}</dd>
            </div>
        </div>
    );
}
