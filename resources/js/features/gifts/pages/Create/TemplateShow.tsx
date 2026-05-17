import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Gift, Lock, Sparkles } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

import { formatPrice } from '../../components/formatters';
import type { OccasionSummary, PlanSummary, TemplateVersionSummary, ThemeSummary } from '../../types';

type TemplateShowProps = {
    occasion: OccasionSummary;
    template: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
    };
    templateVersion: TemplateVersionSummary;
    theme: ThemeSummary;
    plan: PlanSummary | null;
    createUrl: string;
    loginUrl: string;
    registerUrl: string;
    isAuthenticated: boolean;
};

export default function TemplateShow({
    occasion,
    template,
    templateVersion,
    theme,
    plan,
    createUrl,
    loginUrl,
    registerUrl,
    isAuthenticated,
}: TemplateShowProps) {
    const { data, setData, post, processing, errors } = useForm({
        template_version_id: templateVersion.id,
        theme_version_id: theme.id,
        plan_id: plan?.id ?? '',
        title: '',
        recipient_name: '',
        sender_name: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(createUrl);
    }

    return (
        <>
            <Head title={template.name} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#E5D0B8] bg-[#F4E8D9]/92">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#42291D]"
                            href={`/criar/${occasion.slug}`}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Templates
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
                    <div>
                        <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">{occasion.name}</p>
                        <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#1F150A] sm:text-5xl">
                            {template.name}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#42291D]">
                            {template.description ??
                                'Este template publicado cria um rascunho com páginas copiadas para o seu gift.'}
                        </p>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            <InfoTile
                                icon={<Sparkles aria-hidden="true" className="h-5 w-5" />}
                                label="Tema"
                                value={theme.name}
                            />
                            <InfoTile
                                icon={<CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
                                label="Páginas"
                                value={`${templateVersion.page_count}`}
                            />
                            <InfoTile
                                icon={<Gift aria-hidden="true" className="h-5 w-5" />}
                                label="Plano"
                                value={plan ? formatPrice(plan.price_cents, plan.currency) : 'A definir'}
                            />
                        </div>

                        <section className="mt-8 rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#1F150A]">Páginas incluídas</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {templateVersion.pages.map((page) => (
                                    <div
                                        className="rounded-[6px] border border-[#E5D0B8] bg-[#FFFBF6] p-4"
                                        key={page.id}
                                    >
                                        <p className="text-sm font-semibold text-[#1F150A]">{page.name}</p>
                                        <p className="mt-1 text-xs font-semibold uppercase text-[#D93632]">
                                            {page.page_type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-[0_16px_40px_#221C1917]">
                        <h2 className="text-xl font-semibold text-[#1F150A]">Criar rascunho</h2>
                        <p className="mt-2 text-sm leading-6 text-[#42291D]">
                            O gift nasce como draft e fica disponível no painel para continuar editando.
                        </p>

                        {isAuthenticated ? (
                            <form className="mt-5 grid gap-4" onSubmit={submit}>
                                <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                                    Título
                                    <input
                                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal outline-none focus:border-[#D93632]"
                                        maxLength={120}
                                        onChange={(event) => setData('title', event.target.value)}
                                        placeholder={template.name}
                                        value={data.title}
                                    />
                                    {errors.title && <span className="text-xs text-[#D93632]">{errors.title}</span>}
                                </label>
                                <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                                    Para
                                    <input
                                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal outline-none focus:border-[#D93632]"
                                        maxLength={80}
                                        onChange={(event) => setData('recipient_name', event.target.value)}
                                        value={data.recipient_name}
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                                    De
                                    <input
                                        className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal outline-none focus:border-[#D93632]"
                                        maxLength={80}
                                        onChange={(event) => setData('sender_name', event.target.value)}
                                        value={data.sender_name}
                                    />
                                </label>
                                <button
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-5 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#B92827] disabled:opacity-60"
                                    disabled={processing}
                                    type="submit"
                                >
                                    Criar meu scrapbook
                                </button>
                            </form>
                        ) : (
                            <div className="mt-5 grid gap-3">
                                <Link
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-5 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#B92827]"
                                    href={loginUrl}
                                >
                                    <Lock aria-hidden="true" className="h-4 w-4" />
                                    Entrar para criar
                                </Link>
                                <Link
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[6px] border border-[#CBA980] bg-white px-5 text-sm font-semibold text-[#42291D] transition hover:bg-[#EAD2B8]"
                                    href={registerUrl}
                                >
                                    Criar conta
                                </Link>
                            </div>
                        )}
                    </aside>
                </section>
            </main>
        </>
    );
}

type InfoTileProps = {
    icon: ReactNode;
    label: string;
    value: string;
};

function InfoTile({ icon, label, value }: InfoTileProps) {
    return (
        <div className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4">
            <div className="text-[#D93632]">{icon}</div>
            <p className="mt-3 text-xs font-semibold uppercase text-[#D93632]">{label}</p>
            <p className="mt-1 text-base font-semibold text-[#1F150A]">{value}</p>
        </div>
    );
}
