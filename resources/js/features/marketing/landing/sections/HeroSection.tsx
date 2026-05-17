import { Quote, Star } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { ScrapbookMockup } from '../components/ScrapbookMockup';
import { SectionBadge } from '../components/SectionBadge';
import { Sticker } from '../components/Sticker';

export function HeroSection() {
    return (
        <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20" id="topo">
            <div className="absolute inset-x-0 top-0 h-px bg-[#ead8bf]" />
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8">
                <div className="relative z-10">
                    <SectionBadge>Presente digital com cara de feito à mão</SectionBadge>

                    <div className="mt-7 max-w-3xl">
                        <h1 className="text-balance text-4xl font-semibold leading-[1.05] text-[#3A2418] sm:text-5xl lg:text-6xl">
                            Crie um scrapbook digital para emocionar{' '}
                            <span className="relative inline-block">
                                <span className="font-hand text-[1.18em] font-semibold text-[#8E2F2F]">
                                    quem você ama.
                                </span>
                                <span className="absolute -bottom-1 left-2 right-1 h-2 rounded-full bg-[#C99A4A]/35" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6F4E37] sm:text-xl">
                            Monte um presente com fotos, cartas, música e páginas interativas em poucos minutos. Envie
                            por link ou QR Code.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <CTAButton href="/criar">Criar meu presente</CTAButton>
                        <CTAButton href="/demo" icon="play" variant="secondary">
                            Ver demo interativa
                        </CTAButton>
                    </div>

                    <div className="mt-8 max-w-xl rounded-[8px] border border-[#ead8bf] bg-[#FFF8EC]/82 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 text-[#C99A4A]" aria-label="Cinco estrelas">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star aria-hidden="true" className="h-4 w-4 fill-current" key={index} />
                            ))}
                        </div>
                        <div className="mt-3 flex gap-3">
                            <Quote aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#C96F72]" />
                            <p className="text-sm leading-6 text-[#6F4E37]">
                                "Parece um caderno feito à mão, mas abre lindo no celular. Foi o presente mais pessoal
                                que eu já enviei."
                            </p>
                        </div>
                    </div>

                    <Sticker className="mt-6 -rotate-2" tone="gold">
                        fotos, cartas e saudade
                    </Sticker>
                </div>

                <ScrapbookMockup />
            </div>
        </section>
    );
}
