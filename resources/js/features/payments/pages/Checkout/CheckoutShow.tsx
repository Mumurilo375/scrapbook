import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, CreditCard, XCircle } from 'lucide-react';
import { useState } from 'react';

import { CheckoutSummary } from '../../components/CheckoutSummary';
import { DevPaymentNotice } from '../../components/DevPaymentNotice';
import { OrderStatusCard } from '../../components/OrderStatusCard';
import { PlanSummaryCard } from '../../components/PlanSummaryCard';
import type { CheckoutGiftSummary, CheckoutOrderSummary, CheckoutPlanSummary, PublicationCheck } from '../../types';

type CheckoutShowProps = {
    gift: CheckoutGiftSummary;
    plan: CheckoutPlanSummary | null;
    order: CheckoutOrderSummary | null;
    checks: PublicationCheck[];
    can_checkout: boolean;
    urls: {
        store: string;
    };
    dev_mode: boolean;
};

export default function CheckoutShow({ gift, plan, order, checks, can_checkout, urls, dev_mode }: CheckoutShowProps) {
    const [submitting, setSubmitting] = useState(false);
    const failedErrors = checks.filter((check) => check.severity === 'error' && !check.passed);

    function createOrder() {
        if (!can_checkout || submitting || order) {
            return;
        }

        setSubmitting(true);

        router.post(
            urls.store,
            {},
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <>
            <Head title={`Finalizar ${gift.title}`} />
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
                            href={gift.urls.review}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para revisão
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <CheckoutSummary gift={gift} />
                        <PlanSummaryCard plan={plan} />
                        {dev_mode ? <DevPaymentNotice /> : null}
                    </div>

                    <div className="grid content-start gap-5">
                        {order ? <OrderStatusCard order={order} /> : null}

                        <section
                            className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                                backgroundSize: 'auto, 460px 460px',
                            }}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">
                                        Requisitos
                                    </p>
                                    <h2 className="mt-3 font-display text-xl font-bold text-[#181024]">
                                        {failedErrors.length === 0 ? 'Pronto para finalizar' : 'Ajustes necessários'}
                                    </h2>
                                    <p className="mt-2 text-sm text-[#6F6877]">
                                        O pedido só é criado quando os requisitos obrigatórios do presente estão
                                        válidos.
                                    </p>
                                </div>
                                <StatusPill errors={failedErrors.length} />
                            </div>

                            <div className="mt-5 grid gap-3">
                                {checks.map((check) => (
                                    <CheckRow check={check} key={check.key} />
                                ))}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {order ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                        href={order.url}
                                    >
                                        Ver pedido
                                    </Link>
                                ) : (
                                    <button
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={!can_checkout || !plan || submitting}
                                        onClick={createOrder}
                                        type="button"
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        {submitting ? 'Criando pedido...' : 'Criar pedido'}
                                    </button>
                                )}
                                <Link
                                    className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#A98BC4] bg-white px-4 text-sm font-semibold text-[#6F6877] hover:bg-[#EFE9F3]"
                                    href={gift.urls.edit}
                                >
                                    Ajustar no editor
                                </Link>
                            </div>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

type StatusPillProps = {
    errors: number;
};

function StatusPill({ errors }: StatusPillProps) {
    if (errors > 0) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FF705F] bg-[#FFF0ED] px-3 py-1 text-xs font-semibold text-[#D95045]">
                <XCircle aria-hidden="true" className="h-4 w-4" />
                {errors} pendente{errors > 1 ? 's' : ''}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#73A58E] bg-[#E8F2ED] px-3 py-1 text-xs font-semibold text-[#2E6856]">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            Pronto
        </span>
    );
}

type CheckRowProps = {
    check: PublicationCheck;
};

function CheckRow({ check }: CheckRowProps) {
    const failed = !check.passed;
    const icon = check.passed ? (
        <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-[#2E6856]" />
    ) : check.severity === 'warning' ? (
        <AlertTriangle aria-hidden="true" className="h-5 w-5 text-[#8A5A1F]" />
    ) : (
        <XCircle aria-hidden="true" className="h-5 w-5 text-[#FF705F]" />
    );

    return (
        <div className="grid grid-cols-[auto_1fr] gap-3 border-b border-[#D6CFDD] bg-white/70 px-3 py-3 last:border-b-0">
            <div className="pt-0.5">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-[#181024]">{check.label}</p>
                {failed && check.message ? <p className="mt-1 text-sm text-[#6F6877]">{check.message}</p> : null}
            </div>
        </div>
    );
}
