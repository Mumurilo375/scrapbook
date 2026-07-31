import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, ClipboardCheck, CreditCard, ExternalLink, Gift, LogOut, PenLine, Plus, Share2 } from 'lucide-react';

import { formatDate } from '../../components/formatters';
import { GiftStatusBadge } from '../../components/GiftStatusBadge';
import type { GiftSummary } from '../../types';

type GiftIndexProps = {
    gifts: GiftSummary[];
    createUrl: string;
};

export default function GiftIndex({ gifts, createUrl }: GiftIndexProps) {
    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title="Meus presentes" />
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
                            <button
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-transparent px-4 text-sm font-bold text-[#D8CFDF] hover:bg-[#281D36] hover:text-white"
                                onClick={logout}
                                type="button"
                            >
                                <LogOut aria-hidden="true" className="h-4 w-4" />
                                Sair
                            </button>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                href={createUrl}
                            >
                                <Plus aria-hidden="true" className="h-4 w-4" />
                                Criar novo
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#A98BC4] pb-7">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Sua coleção</p>
                            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] text-[#181024]">
                                Meus presentes
                            </h1>
                        </div>
                        <p className="border-b border-[#A98BC4] pb-1 text-sm font-bold text-[#6F6877]">
                            {gifts.length} {gifts.length === 1 ? 'presente' : 'presentes'}
                        </p>
                    </div>

                    <div
                        className="relative mt-8 overflow-hidden rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_9px_0_#CFC1AE,0_22px_40px_#18102418]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                            backgroundPosition: 'center',
                            backgroundSize: 'auto, 520px 520px',
                        }}
                    >
                        <span aria-hidden="true" className="absolute bottom-0 left-14 top-0 w-px bg-[#C9BAD8]" />
                        {gifts.length > 0 ? (
                            <div className="divide-y divide-[#D6CFDD]">
                                {gifts.map((gift, giftIndex) => (
                                    <article
                                        className="relative grid gap-4 py-5 pl-20 pr-5 transition hover:bg-white/55 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto]"
                                        key={gift.id}
                                    >
                                        <span className="absolute left-3 top-5 grid h-9 w-9 place-items-center font-display text-base font-bold tabular-nums text-[#A193AA]">
                                            {String(giftIndex + 1).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <GiftStatusBadge status={gift.status} />
                                            <h2 className="mt-3 font-display text-lg font-bold text-[#181024]">
                                                {gift.title}
                                            </h2>
                                            <p className="mt-1 text-sm text-[#6F6877]">
                                                {gift.occasion?.name ?? 'Sem ocasião'} ·{' '}
                                                {gift.template?.name ?? 'Sem modelo'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-[#6F6877]">
                                            <p className="font-semibold text-[#181024]">Última edição</p>
                                            <p className="mt-1">{formatDate(gift.last_edited_at ?? gift.updated_at)}</p>
                                        </div>
                                        <div className="text-sm text-[#6F6877]">
                                            <p className="font-semibold text-[#181024]">
                                                {gift.status === 'published' ? 'Publicado' : 'Expiração'}
                                            </p>
                                            <p className="mt-1">
                                                {gift.status === 'published'
                                                    ? formatDate(gift.published_at ?? null)
                                                    : formatDate(gift.expires_at ?? null)}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                                            <Link
                                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                                                href={gift.edit_url}
                                            >
                                                <PenLine aria-hidden="true" className="h-4 w-4" />
                                                Editar
                                            </Link>
                                            {gift.public_url && gift.share_url ? (
                                                <>
                                                    <Link
                                                        className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                                                        href={gift.analytics_url}
                                                    >
                                                        <BarChart3 aria-hidden="true" className="h-4 w-4" />
                                                        Analytics
                                                    </Link>
                                                    <Link
                                                        className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                                        href={gift.share_url}
                                                    >
                                                        <Share2 aria-hidden="true" className="h-4 w-4" />
                                                        Compartilhar
                                                    </Link>
                                                    <Link
                                                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-[#E8F2ED] px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#DCE4CB]"
                                                        href={gift.public_url}
                                                    >
                                                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                                                        Abrir link
                                                    </Link>
                                                </>
                                            ) : gift.status === 'pending_payment' && gift.order_url ? (
                                                <Link
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                                    href={gift.order_url}
                                                >
                                                    <CreditCard aria-hidden="true" className="h-4 w-4" />
                                                    Ver pedido
                                                </Link>
                                            ) : (
                                                <Link
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                                    href={gift.review_url}
                                                >
                                                    <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                                                    Revisar
                                                </Link>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="grid gap-4 p-8 pl-20 text-[#6F6877]">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#181024]">
                                        Nenhum presente criado ainda
                                    </h2>
                                    <p className="mt-2 text-sm text-[#6F6877]">
                                        Escolha uma ocasião e comece com um modelo pronto para editar.
                                    </p>
                                </div>
                                <Link
                                    className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-4 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                    href={createUrl}
                                >
                                    <Plus aria-hidden="true" className="h-4 w-4" />
                                    Escolher uma ocasião
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
