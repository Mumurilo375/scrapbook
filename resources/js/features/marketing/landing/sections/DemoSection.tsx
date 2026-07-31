import { PlayCircle, Sparkles } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { PhoneMockup } from '../components/PhoneMockup';
import { PolaroidCard } from '../components/PolaroidCard';
import { SectionBadge } from '../components/SectionBadge';

export function DemoSection() {
    return (
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8" id="demo">
            <div
                className="relative mx-auto max-w-7xl overflow-hidden rounded-[12px] border border-[#4B3D59] bg-[#181024] text-[#FBF7ED] shadow-[0_28px_70px_#1810243D]"
                style={{
                    backgroundImage:
                        "linear-gradient(120deg,rgba(169,139,196,.12),transparent 46%),url('/materials/bookcloth-aubergine.webp')",
                    backgroundPosition: 'center',
                    backgroundSize: 'auto, 520px 520px',
                }}
            >
                <div className="paper-grain absolute inset-0 opacity-35" />
                <div className="torn-strip absolute inset-x-0 top-0 h-5 bg-[#E5DDED]" />

                <div className="relative grid gap-10 px-5 pb-8 pt-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-12 lg:pt-16">
                    <div className="flex flex-col justify-center">
                        <SectionBadge tone="dark">Demo interativa</SectionBadge>
                        <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                            Teste uma demo interativa antes de criar o seu.
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-[#CFC2D8] sm:text-lg">
                            Veja como um scrapbook digital pode emocionar antes mesmo de virar presente. A demo pública
                            será o primeiro gostinho da experiência completa.
                        </p>
                        <div className="mt-8">
                            <CTAButton className="border-[#FBF7ED]" href="/demo" icon="play" variant="light">
                                Explorar a demo
                            </CTAButton>
                        </div>
                    </div>

                    <div className="relative min-h-[430px]">
                        <div className="absolute left-2 top-6 z-20 hidden sm:block">
                            <PolaroidCard caption="surpresa" rotate="left" tone="kraft" />
                        </div>
                        <div className="absolute bottom-6 right-0 z-20">
                            <PolaroidCard caption="memória" rotate="right" tone="rose" />
                        </div>
                        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                            <PhoneMockup compact />
                        </div>
                        <div className="absolute bottom-16 left-4 max-w-[220px] rotate-[-4deg] border border-[#C9A779] bg-[#C9A779] p-4 text-[#181024] shadow-[5px_7px_0_#8C645B]">
                            <div className="flex items-center gap-2">
                                <PlayCircle aria-hidden="true" className="h-5 w-5 text-[#FF705F]" />
                                <p className="font-hand text-2xl leading-none">toque para abrir</p>
                            </div>
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#4B3D59]">
                                link público preparado
                            </p>
                        </div>
                        <Sparkles aria-hidden="true" className="absolute right-12 top-16 h-8 w-8 text-[#B8792E]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
