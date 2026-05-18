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
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Gift</p>
                    <h1 className="mt-3 text-3xl font-semibold text-[#1F150A]">{gift.title}</h1>
                    <p className="mt-2 text-sm font-semibold text-[#6F5A4A]">
                        {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                        {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                    </p>
                </div>
                <GiftStatusBadge status={gift.status} />
            </div>

            <dl className="mt-5 grid gap-3 text-sm text-[#42291D] sm:grid-cols-2">
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
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                    href={gift.urls.preview}
                >
                    <Eye aria-hidden="true" className="h-4 w-4" />
                    Preview
                </Link>
                <Link
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
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
        <div className="flex items-center gap-3 rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3">
            <span className="text-[#D93632]">{icon}</span>
            <div>
                <dt className="font-semibold text-[#1F150A]">{label}</dt>
                <dd className="mt-0.5">{value}</dd>
            </div>
        </div>
    );
}
