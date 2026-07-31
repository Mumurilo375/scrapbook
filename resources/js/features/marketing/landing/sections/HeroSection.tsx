import { Quote, Star } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { ScrapbookMockup } from '../components/ScrapbookMockup';
import { SectionBadge } from '../components/SectionBadge';
import { Sticker } from '../components/Sticker';

export function HeroSection() {
    return (
        <section
            className="relative isolate overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16"
            id="topo"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(75,61,89,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(75,61,89,.075) 1px,transparent 1px),radial-gradient(circle at 70% 45%,rgba(255,255,255,.78),transparent 48%)',
                backgroundSize: '32px 32px,32px 32px,auto',
            }}
        >
            <div className="absolute inset-x-0 top-0 h-px bg-[#C9BAD8]" />
            <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
                <div className="relative z-10">
                    <SectionBadge>Presente digital com cara de feito à mão</SectionBadge>

                    <div className="mt-7 max-w-3xl">
                        <h1 className="text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-[#181024] sm:text-5xl lg:text-6xl">
                            Crie um scrapbook digital para emocionar{' '}
                            <span className="relative inline-block">
                                <span className="font-hand text-[1.16em] font-semibold text-[#D95045]">
                                    quem você ama.
                                </span>
                                <span className="absolute -bottom-1 left-2 right-1 h-2 bg-[#C9A779]/45 [clip-path:polygon(0_32%,100%_0,98%_78%,3%_100%)]" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#514A59] sm:text-xl">
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

                    <div
                        className="relative mt-8 hidden max-w-xl -rotate-[0.4deg] border border-[#C9BAD8] bg-[#FBF7ED] p-4 shadow-[4px_6px_0_#CFC1AE,0_15px_28px_#18102412] sm:block"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,247,237,.86),rgba(251,247,237,.86)),url('/materials/cotton-paper.webp')",
                            backgroundSize: 'auto, 420px 420px',
                        }}
                    >
                        <div className="flex flex-wrap items-center gap-2 text-[#B8792E]" aria-label="Cinco estrelas">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star aria-hidden="true" className="h-4 w-4 fill-current" key={index} />
                            ))}
                        </div>
                        <div className="mt-3 flex gap-3">
                            <Quote aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#FF705F]" />
                            <p className="text-sm leading-6 text-[#514A59]">
                                "Parece um caderno feito à mão, mas abre lindo no celular. Foi o presente mais pessoal
                                que eu já enviei."
                            </p>
                        </div>
                    </div>

                    <Sticker className="mt-6 -rotate-2 max-sm:hidden" tone="gold">
                        fotos, cartas e saudade
                    </Sticker>
                </div>

                <ScrapbookMockup />
            </div>
        </section>
    );
}
