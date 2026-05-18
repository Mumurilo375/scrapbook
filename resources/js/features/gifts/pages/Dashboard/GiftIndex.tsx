import { Head, Link, router } from '@inertiajs/react';
import { ClipboardCheck, CreditCard, ExternalLink, Gift, LogOut, PenLine, Plus } from 'lucide-react';

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
            <Head title="Meus gifts" />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#E5D0B8] bg-[#F4E8D9]/92">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                            <button
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-4 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                                onClick={logout}
                                type="button"
                            >
                                <LogOut aria-hidden="true" className="h-4 w-4" />
                                Sair
                            </button>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-4 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                href={createUrl}
                            >
                                <Plus aria-hidden="true" className="h-4 w-4" />
                                Criar novo
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Painel</p>
                        <h1 className="mt-4 text-4xl font-semibold text-[#1F150A]">Meus gifts</h1>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] shadow-sm">
                        {gifts.length > 0 ? (
                            <div className="divide-y divide-[#E5D0B8]">
                                {gifts.map((gift) => (
                                    <article
                                        className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto]"
                                        key={gift.id}
                                    >
                                        <div>
                                            <GiftStatusBadge status={gift.status} />
                                            <h2 className="mt-3 text-lg font-semibold text-[#1F150A]">{gift.title}</h2>
                                            <p className="mt-1 text-sm text-[#42291D]">
                                                {gift.occasion?.name ?? 'Sem ocasião'} ·{' '}
                                                {gift.template?.name ?? 'Sem template'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-[#42291D]">
                                            <p className="font-semibold text-[#1F150A]">Última edição</p>
                                            <p className="mt-1">{formatDate(gift.last_edited_at ?? gift.updated_at)}</p>
                                        </div>
                                        <div className="text-sm text-[#42291D]">
                                            <p className="font-semibold text-[#1F150A]">
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
                                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                                                href={gift.edit_url}
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
                                                    Ver link
                                                </Link>
                                            ) : gift.status === 'pending_payment' && gift.order_url ? (
                                                <Link
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                                    href={gift.order_url}
                                                >
                                                    <CreditCard aria-hidden="true" className="h-4 w-4" />
                                                    Ver pedido
                                                </Link>
                                            ) : (
                                                <Link
                                                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
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
                            <div className="p-6 text-[#42291D]">
                                <p>Você ainda não criou nenhum gift.</p>
                                <Link className="mt-4 inline-flex font-semibold text-[#D93632]" href={createUrl}>
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
