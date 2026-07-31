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
            <main
                className="min-h-screen bg-[#E5DDED] font-sans text-[#292331]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(75,61,89,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(75,61,89,.07) 1px,transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            >
                <header
                    className="border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] px-3 text-sm font-bold text-white hover:bg-[#281D36]"
                            href={`/criar/${occasion.slug}`}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Templates
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">{occasion.name}</p>
                        <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-5xl">
                            {template.name}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#514A59]">
                            {template.description ??
                                'Este template publicado cria um rascunho com páginas copiadas para o seu gift.'}
                        </p>

                        <div className="relative mt-10 rounded-[18px] border border-[#291B2B] bg-[#43283D] p-3 shadow-[0_26px_48px_#18102435] sm:p-5">
                            <div className="grid aspect-[2/1] grid-cols-2 overflow-hidden rounded-[12px] border border-[#CFC1AE] bg-[#FBF7ED]">
                                {[templateVersion.pages[0], templateVersion.pages[1] ?? templateVersion.pages[0]].map(
                                    (page, index) => (
                                        <div
                                            className={`relative grid content-center justify-items-center p-5 text-center ${
                                                index === 0
                                                    ? 'border-r border-[#CFC1AE] shadow-[inset_-24px_0_34px_#43283D1F]'
                                                    : 'shadow-[inset_24px_0_34px_#43283D1F]'
                                            }`}
                                            key={`${page?.id ?? 'page'}-${index}`}
                                            style={{
                                                backgroundImage:
                                                    "linear-gradient(rgba(251,247,237,.8),rgba(251,247,237,.8)),url('/materials/cotton-paper.webp')",
                                                backgroundSize: 'auto, 420px 420px',
                                            }}
                                        >
                                            <span className="absolute left-[18%] top-[18%] h-5 w-[34%] -rotate-3 bg-[#C9A779]/70" />
                                            <span className="grid h-14 w-16 place-items-center border border-[#C9BAD8] bg-white text-[#D95045] shadow-[0_7px_14px_#1810241C] sm:h-20 sm:w-24">
                                                <Sparkles aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </span>
                                            <p className="mt-4 max-w-[16ch] font-hand text-lg leading-none text-[#292331] sm:text-2xl">
                                                {page?.name ?? template.name}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                            <span className="absolute bottom-4 left-1/2 top-4 w-7 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#43283D]/25 to-transparent" />
                            {[28, 50, 72].map((top) => (
                                <span
                                    aria-hidden="true"
                                    className="absolute left-1/2 h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full border-2 border-[#9D846C]"
                                    key={top}
                                    style={{ top: `${top}%` }}
                                />
                            ))}
                        </div>

                        <div className="mt-8 grid overflow-hidden border border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_8px_0_#CFC1AE] md:grid-cols-3 md:divide-x md:divide-[#D6CFDD]">
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

                        <section className="mt-8 border border-[#C9BAD8] bg-[#281D36] p-5 text-white shadow-[0_14px_28px_#18102420]">
                            <h2 className="font-display text-xl font-bold">Páginas incluídas</h2>
                            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                                {templateVersion.pages.map((page) => (
                                    <div
                                        className="min-h-28 w-36 shrink-0 border border-[#CFC1AE] bg-[#FBF7ED] p-3 text-[#292331] shadow-[0_6px_0_#CFC1AE]"
                                        key={page.id}
                                    >
                                        <span className="block h-8 border border-[#D6CFDD] bg-[#EFE9F3]" />
                                        <p className="mt-3 text-sm font-bold text-[#181024]">{page.name}</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#D95045]">
                                            {page.page_type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside
                        className="h-fit rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_18px_40px_#18102424] lg:sticky lg:top-6"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                            backgroundSize: 'auto, 420px 420px',
                        }}
                    >
                        <h2 className="font-display text-xl font-bold text-[#181024]">Criar rascunho</h2>
                        <p className="mt-2 text-sm leading-6 text-[#6F6877]">
                            O gift nasce como draft e fica disponível no painel para continuar editando.
                        </p>

                        {isAuthenticated ? (
                            <form className="mt-5 grid gap-4 border-t border-[#D6CFDD] pt-5" onSubmit={submit}>
                                <label className="grid gap-2 text-sm font-bold text-[#181024]">
                                    Título
                                    <input
                                        className="min-h-12 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-normal outline-none focus:border-[#181024] focus:ring-2 focus:ring-[#A98BC455]"
                                        maxLength={120}
                                        onChange={(event) => setData('title', event.target.value)}
                                        placeholder={template.name}
                                        value={data.title}
                                    />
                                    {errors.title && <span className="text-xs text-[#C8444B]">{errors.title}</span>}
                                </label>
                                <label className="grid gap-2 text-sm font-bold text-[#181024]">
                                    Para
                                    <input
                                        className="min-h-12 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-normal outline-none focus:border-[#181024] focus:ring-2 focus:ring-[#A98BC455]"
                                        maxLength={80}
                                        onChange={(event) => setData('recipient_name', event.target.value)}
                                        value={data.recipient_name}
                                    />
                                </label>
                                <label className="grid gap-2 text-sm font-bold text-[#181024]">
                                    De
                                    <input
                                        className="min-h-12 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-normal outline-none focus:border-[#181024] focus:ring-2 focus:ring-[#A98BC455]"
                                        maxLength={80}
                                        onChange={(event) => setData('sender_name', event.target.value)}
                                        value={data.sender_name}
                                    />
                                </label>
                                <button
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-5 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] transition hover:-translate-y-px hover:bg-[#FF8273] disabled:opacity-60"
                                    disabled={processing}
                                    type="submit"
                                >
                                    Criar meu scrapbook
                                </button>
                            </form>
                        ) : (
                            <div className="mt-5 grid gap-3">
                                <Link
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-5 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] transition hover:-translate-y-px hover:bg-[#FF8273]"
                                    href={loginUrl}
                                >
                                    <Lock aria-hidden="true" className="h-4 w-4" />
                                    Entrar para criar
                                </Link>
                                <Link
                                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[6px] border border-[#A98BC4] bg-white px-5 text-sm font-semibold text-[#6F6877] transition hover:bg-[#EFE9F3]"
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
        <div className="p-4">
            <div className="text-[#D95045]">{icon}</div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-[#D95045]">{label}</p>
            <p className="mt-1 text-base font-bold text-[#181024]">{value}</p>
        </div>
    );
}
