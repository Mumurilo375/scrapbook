import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clipboard,
    CreditCard,
    ExternalLink,
    Eye,
    Gift,
    PenLine,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { GiftStatusBadge } from '../../components/GiftStatusBadge';
import { formatDate } from '../../components/formatters';

type PublicationCheck = {
    key: string;
    label: string;
    passed: boolean;
    severity: 'error' | 'warning';
    message?: string;
};

type ReviewGift = {
    id: string;
    title: string;
    status: string;
    recipient_name: string | null;
    sender_name: string | null;
    published_at: string | null;
    expires_at: string | null;
    page_count: number;
    visible_page_count: number;
    media_count: number;
    can_publish: boolean;
    can_checkout: boolean;
    checks: PublicationCheck[];
    order: {
        id: string;
        status: string;
        amount_cents: number;
        currency: string;
        url: string;
    } | null;
    public_url: string | null;
    urls: {
        dashboard: string;
        edit: string;
        preview: string;
        checkout: string;
        publish: string;
        public: string | null;
    };
};

type GiftReviewProps = {
    gift: ReviewGift;
};

export default function GiftReview({ gift }: GiftReviewProps) {
    const [copied, setCopied] = useState(false);
    const failedErrors = gift.checks.filter((check) => check.severity === 'error' && !check.passed);
    const warnings = gift.checks.filter((check) => check.severity === 'warning' && !check.passed);
    const isPublished = gift.status === 'published' && Boolean(gift.public_url);

    async function copyPublicUrl() {
        if (!gift.public_url) {
            return;
        }

        await navigator.clipboard.writeText(new URL(gift.public_url, window.location.origin).toString());
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    }

    return (
        <>
            <Head title={`Revisar ${gift.title}`} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                                href={gift.urls.dashboard}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Meus presentes
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
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
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <div>
                            <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Revisão</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 className="text-4xl font-semibold text-[#1F150A]">{gift.title}</h1>
                                <GiftStatusBadge status={gift.status} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#6F5A4A]">
                                {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                                {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                            </p>
                        </div>

                        <dl className="grid gap-3 rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 text-sm text-[#42291D] shadow-sm">
                            <Info label="Páginas visíveis" value={`${gift.visible_page_count} de ${gift.page_count}`} />
                            <Info label="Fotos processadas" value={`${gift.media_count}`} />
                            <Info label="Publicado em" value={formatDate(gift.published_at)} />
                            <Info label="Expira em" value={formatDate(gift.expires_at)} />
                        </dl>

                        {gift.public_url ? (
                            <div className="rounded-[8px] border border-[#7E8F68] bg-[#F2F5E8] p-4 shadow-sm">
                                <p className="text-sm font-semibold text-[#48573A]">Link público disponível</p>
                                <p className="mt-2 break-all text-sm text-[#42291D]">{gift.public_url}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-white px-3 text-sm font-semibold text-[#48573A] hover:bg-[#E7EBD8]"
                                        href={gift.public_url}
                                    >
                                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                        Abrir link
                                    </Link>
                                    <button
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-white px-3 text-sm font-semibold text-[#48573A] hover:bg-[#E7EBD8]"
                                        onClick={copyPublicUrl}
                                        type="button"
                                    >
                                        <Clipboard aria-hidden="true" className="h-4 w-4" />
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid content-start gap-5">
                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#1F150A]">Checklist de publicação</h2>
                                    <p className="mt-1 text-sm text-[#6F5A4A]">
                                        {failedErrors.length === 0
                                            ? 'O gift atende aos requisitos obrigatórios.'
                                            : 'Resolva os itens obrigatórios antes de publicar.'}
                                    </p>
                                </div>
                                <StatusPill errors={failedErrors.length} warnings={warnings.length} />
                            </div>

                            <div className="mt-5 grid gap-3">
                                {gift.checks.map((check) => (
                                    <CheckRow check={check} key={check.key} />
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#1F150A]">Próximo passo</h2>
                            <p className="mt-2 text-sm text-[#6F5A4A]">
                                A publicação pública agora depende de um pedido com pagamento aprovado. Nesta fase o
                                pagamento real ainda não está integrado; o fluxo manual/dev aprova o pedido em ambiente
                                controlado.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {isPublished && gift.public_url ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-[#E7EBD8] px-4 text-sm font-semibold text-[#48573A] hover:bg-[#DCE4CB]"
                                        href={gift.public_url}
                                    >
                                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                        Abrir link público
                                    </Link>
                                ) : gift.order ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                        href={gift.order.url}
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Ver pedido
                                    </Link>
                                ) : gift.can_checkout ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                        href={gift.urls.checkout}
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Ir para checkout
                                    </Link>
                                ) : (
                                    <button
                                        className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] opacity-50"
                                        disabled
                                        type="button"
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Checkout indisponível
                                    </button>
                                )}
                                <Link
                                    className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827] disabled:cursor-not-allowed disabled:opacity-50"
                                    href={gift.urls.preview}
                                >
                                    <Eye aria-hidden="true" className="h-4 w-4" />
                                    Conferir preview
                                </Link>
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

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div>
            <dt className="font-semibold text-[#1F150A]">{label}</dt>
            <dd className="mt-1">{value}</dd>
        </div>
    );
}

type StatusPillProps = {
    errors: number;
    warnings: number;
};

function StatusPill({ errors, warnings }: StatusPillProps) {
    if (errors > 0) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D93632] bg-[#F8D8D3] px-3 py-1 text-xs font-semibold text-[#8F211F]">
                <XCircle aria-hidden="true" className="h-4 w-4" />
                {errors} pendente{errors > 1 ? 's' : ''}
            </span>
        );
    }

    if (warnings > 0) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BD8558] bg-[#EBC493] px-3 py-1 text-xs font-semibold text-[#42291D]">
                <AlertTriangle aria-hidden="true" className="h-4 w-4" />
                {warnings} aviso{warnings > 1 ? 's' : ''}
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
