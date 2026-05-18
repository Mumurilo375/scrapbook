import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, ExternalLink, Eye, PenLine } from 'lucide-react';
import { useState } from 'react';

import { GiftStatusBadge } from '../../../gifts/components/GiftStatusBadge';
import { formatDate, formatPrice } from '../../../gifts/components/formatters';
import { DevPaymentNotice } from '../../components/DevPaymentNotice';
import { OrderStatusCard } from '../../components/OrderStatusCard';
import { PaymentPendingNotice } from '../../components/PaymentPendingNotice';
import type { OrderShowData } from '../../types';

type OrderShowProps = {
    order: OrderShowData;
    dev_approval_enabled: boolean;
};

export default function OrderShow({ order, dev_approval_enabled }: OrderShowProps) {
    const [approving, setApproving] = useState(false);
    const gift = order.gift;
    const paid = order.status === 'paid' || order.payment_status === 'approved';

    function approve() {
        if (!dev_approval_enabled || approving || paid) {
            return;
        }

        setApproving(true);
        router.post(
            order.urls.dev_approve,
            {},
            {
                preserveScroll: true,
                onFinish: () => setApproving(false),
            },
        );
    }

    return (
        <>
            <Head title={`Pedido ${order.id}`} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <CreditCard aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                            href={gift?.urls.dashboard ?? '/app/gifts'}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Meus presentes
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Status</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-semibold text-[#1F150A]">
                                    {gift?.title ?? 'Pedido de gift'}
                                </h1>
                                {gift ? <GiftStatusBadge status={gift.status} /> : null}
                            </div>

                            <dl className="mt-5 grid gap-3 text-sm text-[#42291D] sm:grid-cols-2">
                                <Info label="Plano" value={order.plan?.name ?? 'Plano indisponível'} />
                                <Info label="Valor" value={formatPrice(order.amount_cents, order.currency)} />
                                <Info label="Pago em" value={formatDate(order.paid_at)} />
                                <Info label="Processado em" value={formatDate(order.payment_processed_at)} />
                            </dl>

                            {gift ? (
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
                                    {gift.public_url ? (
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-[#E7EBD8] px-3 text-sm font-semibold text-[#48573A] hover:bg-[#DCE4CB]"
                                            href={gift.public_url}
                                        >
                                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                            Link público
                                        </Link>
                                    ) : null}
                                </div>
                            ) : null}
                        </section>

                        {!paid ? <PaymentPendingNotice /> : null}
                        {dev_approval_enabled && !paid ? (
                            <DevPaymentNotice approving={approving} onApprove={approve} showApproveButton />
                        ) : null}
                    </div>

                    <div className="grid content-start gap-5">
                        <OrderStatusCard order={order} publicUrl={gift?.public_url ?? null} />
                    </div>
                </section>
            </main>
        </>
    );
}

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div className="rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3">
            <dt className="font-semibold text-[#1F150A]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
        </div>
    );
}
