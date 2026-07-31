import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Download, ExternalLink, Eye, PenLine, Share2 } from 'lucide-react';
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
            <Head title="Pedido" />
            <main className="min-h-screen bg-[#E5DDED] font-sans text-[#292331]">
                <header
                    className="border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <CreditCard aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#D8CFDF] hover:text-white"
                            href={gift?.urls.dashboard ?? '/app/gifts'}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Meus presentes
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <section
                            className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                                backgroundSize: 'auto, 460px 460px',
                            }}
                        >
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Status</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#181024]">
                                    {gift?.title ?? 'Pedido do presente'}
                                </h1>
                                {gift ? <GiftStatusBadge status={gift.status} /> : null}
                            </div>

                            <dl className="mt-5 grid gap-3 text-sm text-[#6F6877] sm:grid-cols-2">
                                <Info label="Plano" value={order.plan?.name ?? 'Plano indisponível'} />
                                <Info label="Valor" value={formatPrice(order.amount_cents, order.currency)} />
                                <Info label="Pago em" value={formatDate(order.paid_at)} />
                                <Info label="Processado em" value={formatDate(order.payment_processed_at)} />
                            </dl>

                            {gift ? (
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Link
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-semibold text-[#6F6877] hover:bg-[#EFE9F3]"
                                        href={gift.urls.preview}
                                    >
                                        <Eye aria-hidden="true" className="h-4 w-4" />
                                        Pré-visualizar
                                    </Link>
                                    <Link
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-semibold text-[#6F6877] hover:bg-[#EFE9F3]"
                                        href={gift.urls.edit}
                                    >
                                        <PenLine aria-hidden="true" className="h-4 w-4" />
                                        Editar
                                    </Link>
                                    {gift.public_url ? (
                                        <>
                                            {gift.urls.share ? (
                                                <Link
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                                    href={gift.urls.share}
                                                >
                                                    <Share2 aria-hidden="true" className="h-4 w-4" />
                                                    Compartilhar
                                                </Link>
                                            ) : null}
                                            <Link
                                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-[#E8F2ED] px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#DCE4CB]"
                                                href={gift.public_url}
                                            >
                                                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                                Link público
                                            </Link>
                                            {gift.urls.qr_code_download ? (
                                                <a
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-white px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#E8F2ED]"
                                                    download
                                                    href={gift.urls.qr_code_download}
                                                >
                                                    <Download aria-hidden="true" className="h-4 w-4" />
                                                    Baixar QR
                                                </a>
                                            ) : null}
                                        </>
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
                        {gift?.urls.qr_code ? (
                            <section className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 text-center shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">QR Code</p>
                                <div className="mt-4 inline-flex -rotate-1 border border-[#D6CFDD] bg-white p-4 pb-7 shadow-[0_10px_20px_#18102424]">
                                    <img
                                        alt="QR Code do presente publicado"
                                        className="h-44 w-44"
                                        src={gift.urls.qr_code}
                                    />
                                </div>
                            </section>
                        ) : null}
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
        <div className="border-b border-[#D6CFDD] bg-white/70 px-3 py-3 last:border-b-0">
            <dt className="font-semibold text-[#181024]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
        </div>
    );
}
