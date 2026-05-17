import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Gift, Lock, LogOut } from 'lucide-react';

import { formatDate } from '../../components/formatters';
import { GiftMetadataForm } from '../../components/GiftMetadataForm';
import { GiftPageList } from '../../components/GiftPageList';
import { GiftStatusBadge } from '../../components/GiftStatusBadge';
import type { EditableGift, GiftPageSummary } from '../../types';

type GiftEditProps = {
    gift: EditableGift;
    pages: GiftPageSummary[];
};

export default function GiftEdit({ gift, pages }: GiftEditProps) {
    function logout() {
        router.post('/logout');
    }

    return (
        <>
            <Head title={`Editar ${gift.title}`} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#E5D0B8] bg-[#F4E8D9]/92">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                            <Link
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#42291D]"
                                href={gift.dashboard_url}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Meus gifts
                            </Link>
                            <button
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-4 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                                onClick={logout}
                                type="button"
                            >
                                <LogOut aria-hidden="true" className="h-4 w-4" />
                                Sair
                            </button>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
                    <aside className="space-y-5">
                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <GiftStatusBadge status={gift.status} />
                            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#1F150A]">{gift.title}</h1>
                            <dl className="mt-5 grid gap-3 text-sm text-[#42291D]">
                                <Info label="Ocasião" value={gift.occasion?.name ?? 'Sem ocasião'} />
                                <Info label="Template" value={gift.template?.name ?? 'Sem template'} />
                                <Info label="Tema" value={gift.theme?.name ?? 'Sem tema'} />
                                <Info label="Plano" value={gift.plan?.name ?? 'Sem plano'} />
                                <Info label="Última edição" value={formatDate(gift.last_edited_at)} />
                            </dl>
                            <button
                                className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#EAD2B8] px-4 text-sm font-semibold text-[#42291D] opacity-70"
                                disabled
                                type="button"
                            >
                                <Lock aria-hidden="true" className="h-4 w-4" />
                                Publicar em etapa futura
                            </button>
                        </section>
                    </aside>

                    <div className="space-y-6">
                        <GiftMetadataForm gift={gift} />
                        <section>
                            <div className="mb-4">
                                <h2 className="text-2xl font-semibold text-[#1F150A]">Páginas do rascunho</h2>
                                <p className="mt-2 text-sm leading-6 text-[#42291D]">
                                    As páginas abaixo foram copiadas da versão publicada do template.
                                </p>
                            </div>
                            <GiftPageList pages={pages} />
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
