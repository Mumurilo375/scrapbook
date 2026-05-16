import { Head } from '@inertiajs/react';
import { ArrowLeft, Gift, PlayCircle } from 'lucide-react';

import { CTAButton } from '../features/marketing/landing/components/CTAButton';
import { PaperCard } from '../features/marketing/landing/components/PaperCard';
import { PhoneMockup } from '../features/marketing/landing/components/PhoneMockup';
import { PolaroidCard } from '../features/marketing/landing/components/PolaroidCard';
import { SectionBadge } from '../features/marketing/landing/components/SectionBadge';

export default function Demo() {
    return (
        <>
            <Head title="Demo interativa" />
            <main className="scrapbook-background min-h-screen bg-[#F7F1E8] px-4 py-6 text-[#1F1A17] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <a
                        className="inline-flex items-center gap-2 rounded-full border border-[#d8b98e] bg-[#FFF8EC] px-4 py-2 text-sm font-semibold text-[#6F4E37] transition hover:bg-white"
                        href="/"
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Voltar para a landing
                    </a>

                    <section className="grid items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
                        <div>
                            <SectionBadge>Demo pública</SectionBadge>
                            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-[#3A2418] sm:text-5xl">
                                A demo interativa está sendo preparada para mostrar o presente por dentro.
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6F4E37]">
                                Esta rota já está pronta para receber a experiência pública. Por enquanto, ela apresenta
                                o visual e o caminho de conversão sem antecipar o editor completo.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <CTAButton href="/#preco">Criar meu presente</CTAButton>
                                <CTAButton href="/" variant="secondary">
                                    Ver landing
                                </CTAButton>
                            </div>
                        </div>

                        <div className="relative min-h-[560px]">
                            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
                                <PhoneMockup />
                            </div>
                            <div className="absolute left-2 top-28 z-30 hidden sm:block">
                                <PolaroidCard caption="preview" rotate="left" tone="kraft" />
                            </div>
                            <div className="absolute bottom-6 right-0 z-30">
                                <PolaroidCard caption="demo" rotate="right" tone="rose" />
                            </div>
                            <PaperCard className="absolute bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 p-5">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8E2F2F] text-[#FFF8EC]">
                                        <PlayCircle aria-hidden="true" className="h-6 w-6" />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-[#3A2418]">Experiência pública em breve</p>
                                        <p className="mt-1 text-sm leading-6 text-[#6F4E37]">
                                            O link definitivo vai abrir uma amostra navegável do scrapbook.
                                        </p>
                                    </div>
                                    <Gift aria-hidden="true" className="ml-auto hidden h-5 w-5 text-[#C96F72] sm:block" />
                                </div>
                            </PaperCard>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
