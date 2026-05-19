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
            <main className="min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]" href={gift.urls.dashboard}>
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Meus presentes
                        </Link>
                        <div className="flex flex-wrap gap-2">
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D]" href={gift.urls.edit}>
                                Editar
                            </Link>
                            <Link className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE]" href={gift.urls.share}>
                                <Share2 aria-hidden="true" className="h-4 w-4" />
                                Compartilhar
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase text-[#D93632]">Analytics do presente</p>
                        <h1 className="mt-2 text-3xl font-semibold text-[#1F150A]">{gift.title}</h1>
                        <p className="mt-2 text-sm font-semibold text-[#6F5A4A]">
                            Dados agregados, sem IP, user-agent ou detalhes invasivos dos visitantes.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Metric icon={Eye} label="Visualizações" value={analytics.total_views} />
                        <Metric icon={BarChart3} label="Visitantes estimados" value={analytics.unique_visitors} />
                        <Metric icon={Images} label="Páginas vistas" value={analytics.page_views} />
                        <Metric icon={MousePointerClick} label="Interações" value={analytics.interactions_count} />
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#1F150A]">Engajamento</h2>
                            <dl className="mt-4 grid gap-3 text-sm">
                                <Row label="Conclusões" value={`${analytics.completion_count} (${analytics.completion_rate}%)`} />
                                <Row label="Envelope" value={analytics.envelope_interactions} />
                                <Row label="Polaroid" value={analytics.polaroid_interactions} />
                                <Row label="Último acesso" value={analytics.last_access_at ?? 'Sem visitas'} />
                            </dl>
                        </section>

                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <h2 className="text-lg font-semibold text-[#1F150A]">Origem das visitas</h2>
                            <dl className="mt-4 grid gap-3 text-sm">
                                {Object.entries(analytics.sources).length > 0 ? (
                                    Object.entries(analytics.sources).map(([source, total]) => (
                                        <Row key={source} label={source} value={total} />
                                    ))
                                ) : (
                                    <p className="text-sm font-semibold text-[#6F5A4A]">Sem visitas registradas.</p>
                                )}
                            </dl>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Eye;
    label: string;
    value: number | string;
}) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#6F5A4A]">{label}</p>
                <Icon aria-hidden="true" className="h-5 w-5 text-[#D93632]" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#1F150A]">{value}</p>
        </section>
    );
}

function Row({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[6px] bg-white px-3 py-2">
            <dt className="font-semibold text-[#6F5A4A]">{label}</dt>
            <dd className="font-semibold text-[#1F150A]">{value}</dd>
        </div>
    );
}
