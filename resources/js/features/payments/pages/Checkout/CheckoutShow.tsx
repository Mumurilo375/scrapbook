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
            <Head title={`Checkout ${gift.title}`} />
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
                            href={gift.urls.review}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para revisão
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <CheckoutSummary gift={gift} />
                        <PlanSummaryCard plan={plan} />
                        {dev_mode ? <DevPaymentNotice /> : null}
                    </div>

                    <div className="grid content-start gap-5">
                        {order ? <OrderStatusCard order={order} /> : null}

                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">
                                        Requisitos
                                    </p>
                                    <h2 className="mt-3 text-xl font-semibold text-[#1F150A]">
                                        {failedErrors.length === 0 ? 'Pronto para checkout' : 'Ajustes necessários'}
                                    </h2>
                                    <p className="mt-2 text-sm text-[#6F5A4A]">
                                        O pedido só é criado quando os requisitos obrigatórios do gift estão válidos.
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
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                        href={order.url}
                                    >
                                        Ver pedido
                                    </Link>
                                ) : (
                                    <button
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827] disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={!can_checkout || !plan || submitting}
                                        onClick={createOrder}
                                        type="button"
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        {submitting ? 'Criando pedido...' : 'Criar pedido'}
                                    </button>
                                )}
                                <Link
                                    className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-4 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D93632] bg-[#F8D8D3] px-3 py-1 text-xs font-semibold text-[#8F211F]">
                <XCircle aria-hidden="true" className="h-4 w-4" />
                {errors} pendente{errors > 1 ? 's' : ''}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#7E8F68] bg-[#E7EBD8] px-3 py-1 text-xs font-semibold text-[#48573A]">
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
        <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-[#48573A]" />
    ) : check.severity === 'warning' ? (
        <AlertTriangle aria-hidden="true" className="h-5 w-5 text-[#8A5A1F]" />
    ) : (
        <XCircle aria-hidden="true" className="h-5 w-5 text-[#D93632]" />
    );

    return (
        <div className="grid grid-cols-[auto_1fr] gap-3 rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3">
            <div className="pt-0.5">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-[#1F150A]">{check.label}</p>
                {failed && check.message ? <p className="mt-1 text-sm text-[#6F5A4A]">{check.message}</p> : null}
            </div>
        </div>
    );
}
