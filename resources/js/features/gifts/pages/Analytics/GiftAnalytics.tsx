import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Eye, Images, MousePointerClick, Share2 } from 'lucide-react';

type GiftAnalyticsProps = {
    gift: {
        id: string;
        status: string;
        title: string;
        urls: {
            dashboard: string;
            edit: string;
            share: string;
        };
    };
    analytics: {
        completion_count: number;
        completion_rate: number;
        envelope_interactions: number;
        interactions_count: number;
        last_access_at: string | null;
        page_views: number;
        polaroid_interactions: number;
        sources: Record<string, number>;
        total_views: number;
        unique_visitors: number;
    };
};

export default function GiftAnalytics({ analytics, gift }: GiftAnalyticsProps) {
    return (
        <>
            <Head title={`Analytics ${gift.title}`} />
            <main className="min-h-screen bg-[#E5DDED] font-sans text-[#292331]">
                <header
                    className="border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white"
                            href={gift.urls.dashboard}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Meus presentes
                        </Link>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-[#281D36] px-3 text-sm font-bold text-white hover:bg-[#3A2A48]"
                                href={gift.urls.edit}
                            >
                                Editar
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045]"
                                href={gift.urls.share}
                            >
                                <Share2 aria-hidden="true" className="h-4 w-4" />
                                Compartilhar
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <div className="border-b border-[#A98BC4] pb-7">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">
                            Analytics do presente
                        </p>
                        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.03em] text-[#181024]">
                            {gift.title}
                        </h1>
                        <p className="mt-2 text-sm font-semibold text-[#6F6877]">
                            Dados agregados, sem IP, user-agent ou detalhes invasivos dos visitantes.
                        </p>
                    </div>

                    <div
                        className="grid overflow-hidden border border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_9px_0_#CFC1AE,0_20px_36px_#18102418] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#D6CFDD]"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                            backgroundSize: 'auto, 520px 520px',
                        }}
                    >
                        <Metric icon={Eye} label="Visualizações" value={analytics.total_views} />
                        <Metric icon={BarChart3} label="Visitantes estimados" value={analytics.unique_visitors} />
                        <Metric icon={Images} label="Páginas vistas" value={analytics.page_views} />
                        <Metric icon={MousePointerClick} label="Interações" value={analytics.interactions_count} />
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className="border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_8px_0_#CFC1AE]">
                            <h2 className="font-display text-lg font-bold text-[#181024]">Engajamento</h2>
                            <dl className="mt-4 grid gap-3 text-sm">
                                <Row
                                    label="Conclusões"
                                    value={`${analytics.completion_count} (${analytics.completion_rate}%)`}
                                />
                                <Row label="Envelope" value={analytics.envelope_interactions} />
                                <Row label="Polaroid" value={analytics.polaroid_interactions} />
                                <Row label="Último acesso" value={analytics.last_access_at ?? 'Sem visitas'} />
                            </dl>
                        </section>

                        <section className="border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_8px_0_#CFC1AE]">
                            <h2 className="font-display text-lg font-bold text-[#181024]">Origem das visitas</h2>
                            <dl className="mt-4 grid gap-3 text-sm">
                                {Object.entries(analytics.sources).length > 0 ? (
                                    Object.entries(analytics.sources).map(([source, total]) => (
                                        <Row key={source} label={source} value={total} />
                                    ))
                                ) : (
                                    <p className="text-sm font-semibold text-[#6F6877]">Sem visitas registradas.</p>
                                )}
                            </dl>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number | string }) {
    return (
        <section className="border-b border-[#D6CFDD] p-5 last:border-b-0 lg:border-b-0">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#6F6877]">{label}</p>
                <Icon aria-hidden="true" className="h-5 w-5 text-[#FF705F]" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold text-[#181024]">{value}</p>
        </section>
    );
}

function Row({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-[#D6CFDD] bg-white/65 px-3 py-2 last:border-b-0">
            <dt className="font-semibold text-[#6F6877]">{label}</dt>
            <dd className="font-semibold text-[#181024]">{value}</dd>
        </div>
    );
}
