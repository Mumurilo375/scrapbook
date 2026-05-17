import { Head, Link } from '@inertiajs/react';
import { Gift, Plus } from 'lucide-react';

import { formatDate } from '../../components/formatters';
import { GiftStatusBadge } from '../../components/GiftStatusBadge';
import type { GiftSummary } from '../../types';

type GiftIndexProps = {
    gifts: GiftSummary[];
    createUrl: string;
};

export default function GiftIndex({ gifts, createUrl }: GiftIndexProps) {
    return (
        <>
            <Head title="Meus gifts" />
            <main className="scrapbook-background min-h-screen bg-[#F7F1E8] text-[#1F1A17]">
                <header className="border-b border-[#ead8bf] bg-[#F7F1E8]/92">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#3A2418]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#caa77d] bg-[#FFF8EC] text-[#8E2F2F]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#5f2c24] bg-[#8E2F2F] px-4 text-sm font-semibold text-[#FFF8EC] hover:bg-[#742727]"
                            href={createUrl}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Criar novo
                        </Link>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <p className="font-editorial text-xs font-semibold uppercase text-[#8E2F2F]">Painel</p>
                        <h1 className="mt-4 text-4xl font-semibold text-[#3A2418]">Meus gifts</h1>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] shadow-sm">
                        {gifts.length > 0 ? (
                            <div className="divide-y divide-[#ead8bf]">
                                {gifts.map((gift) => (
                                    <article className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]" key={gift.id}>
                                        <div>
                                            <GiftStatusBadge status={gift.status} />
                                            <h2 className="mt-3 text-lg font-semibold text-[#3A2418]">{gift.title}</h2>
                                            <p className="mt-1 text-sm text-[#6F4E37]">
                                                {gift.occasion?.name ?? 'Sem ocasião'} · {gift.template?.name ?? 'Sem template'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-[#6F4E37]">
                                            <p className="font-semibold text-[#3A2418]">Última edição</p>
                                            <p className="mt-1">{formatDate(gift.last_edited_at ?? gift.updated_at)}</p>
                                        </div>
                                        <div className="text-sm text-[#6F4E37]">
                                            <p className="font-semibold text-[#3A2418]">Expiração</p>
                                            <p className="mt-1">{formatDate(gift.expires_at ?? null)}</p>
                                        </div>
                                        <div className="flex items-center lg:justify-end">
                                            <Link
                                                className="inline-flex min-h-10 items-center rounded-[6px] border border-[#d8b98e] bg-white px-4 text-sm font-semibold text-[#6F4E37] hover:bg-[#f4e2c6]"
                                                href={gift.edit_url}
                                            >
                                                Continuar editando
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-[#6F4E37]">
                                <p>Você ainda não criou nenhum gift.</p>
                                <Link className="mt-4 inline-flex font-semibold text-[#8E2F2F]" href={createUrl}>
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
