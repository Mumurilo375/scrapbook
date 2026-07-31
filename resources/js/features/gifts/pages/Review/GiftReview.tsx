import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clipboard,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    Gift,
    PenLine,
    Printer,
    Share2,
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
        share: string | null;
        qr_code: string | null;
        qr_code_download: string | null;
        share_card: string | null;
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
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#D8CFDF] hover:text-white"
                                href={gift.urls.dashboard}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Meus presentes
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-[#281D36] px-3 text-sm font-bold text-white hover:bg-[#3A2A48]"
                                href={gift.urls.preview}
                            >
                                <Eye aria-hidden="true" className="h-4 w-4" />
                                Preview
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-transparent px-3 text-sm font-bold text-white hover:bg-[#281D36]"
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
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Revisão</p>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-[#181024]">
                                    {gift.title}
                                </h1>
                                <GiftStatusBadge status={gift.status} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#6F6877]">
                                {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                                {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                            </p>
                        </div>

                        <dl className="grid gap-3 border border-[#C9BAD8] bg-[#FBF7ED] p-4 text-sm text-[#6F6877] shadow-[0_7px_0_#CFC1AE]">
                            <Info label="Páginas visíveis" value={`${gift.visible_page_count} de ${gift.page_count}`} />
                            <Info label="Fotos processadas" value={`${gift.media_count}`} />
                            <Info label="Publicado em" value={formatDate(gift.published_at)} />
                            <Info label="Expira em" value={formatDate(gift.expires_at)} />
                        </dl>

                        {gift.public_url ? (
                            <div className="border border-[#73A58E] bg-[#EEF7F2] p-4 shadow-[4px_5px_0_#B8D3C6]">
                                <p className="text-sm font-semibold text-[#2E6856]">Link público disponível</p>
                                <p className="mt-2 break-all text-sm text-[#6F6877]">{gift.public_url}</p>
                                {gift.urls.qr_code ? (
                                    <div className="mt-4 flex justify-center border border-[#D6CFDD] bg-white p-3 shadow-[0_8px_16px_#18102418]">
                                        <img
                                            alt="QR Code do presente publicado"
                                            className="h-32 w-32"
                                            src={gift.urls.qr_code}
                                        />
                                    </div>
                                ) : null}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-white px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#E8F2ED]"
                                        href={gift.public_url}
                                    >
                                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                        Abrir link
                                    </Link>
                                    <button
                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-white px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#E8F2ED]"
                                        onClick={copyPublicUrl}
                                        type="button"
                                    >
                                        <Clipboard aria-hidden="true" className="h-4 w-4" />
                                        {copied ? 'Copiado' : 'Copiar'}
                                    </button>
                                    {gift.urls.share ? (
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                            href={gift.urls.share}
                                        >
                                            <Share2 aria-hidden="true" className="h-4 w-4" />
                                            Compartilhar
                                        </Link>
                                    ) : null}
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
                                    {gift.urls.share_card ? (
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-white px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#E8F2ED]"
                                            href={gift.urls.share_card}
                                        >
                                            <Printer aria-hidden="true" className="h-4 w-4" />
                                            Criar cartão
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid content-start gap-5">
                        <section className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-display text-lg font-bold text-[#181024]">
                                        Checklist de publicação
                                    </h2>
                                    <p className="mt-1 text-sm text-[#6F6877]">
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

                        <section className="rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]">
                            <h2 className="font-display text-lg font-bold text-[#181024]">Próximo passo</h2>
                            <p className="mt-2 text-sm text-[#6F6877]">
                                A publicação pública agora depende de um pedido com pagamento aprovado. Nesta fase o
                                pagamento real ainda não está integrado; o fluxo manual/dev aprova o pedido em ambiente
                                controlado.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {isPublished && gift.public_url ? (
                                    <>
                                        {gift.urls.share ? (
                                            <Link
                                                className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                                href={gift.urls.share}
                                            >
                                                <Share2 aria-hidden="true" className="h-4 w-4" />
                                                Compartilhar
                                            </Link>
                                        ) : null}
                                        <Link
                                            className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-[#E8F2ED] px-4 text-sm font-semibold text-[#2E6856] hover:bg-[#DCE4CB]"
                                            href={gift.public_url}
                                        >
                                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                            Abrir link público
                                        </Link>
                                    </>
                                ) : gift.order ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                        href={gift.order.url}
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Ver pedido
                                    </Link>
                                ) : gift.can_checkout ? (
                                    <Link
                                        className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                        href={gift.urls.checkout}
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Ir para checkout
                                    </Link>
                                ) : (
                                    <button
                                        className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] opacity-50"
                                        disabled
                                        type="button"
                                    >
                                        <CreditCard aria-hidden="true" className="h-4 w-4" />
                                        Checkout indisponível
                                    </button>
                                )}
                                <Link
                                    className="inline-flex min-h-11 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273] disabled:cursor-not-allowed disabled:opacity-50"
                                    href={gift.urls.preview}
                                >
                                    <Eye aria-hidden="true" className="h-4 w-4" />
                                    Conferir preview
                                </Link>
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

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div>
            <dt className="font-semibold text-[#181024]">{label}</dt>
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
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FF705F] bg-[#FFF0ED] px-3 py-1 text-xs font-semibold text-[#D95045]">
                <XCircle aria-hidden="true" className="h-4 w-4" />
                {errors} pendente{errors > 1 ? 's' : ''}
            </span>
        );
    }

    if (warnings > 0) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#B8792E] bg-[#F2E1C8] px-3 py-1 text-xs font-semibold text-[#6F6877]">
                <AlertTriangle aria-hidden="true" className="h-4 w-4" />
                {warnings} aviso{warnings > 1 ? 's' : ''}
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
