import { PhoneMockup } from '../components/PhoneMockup';
import { SectionBadge } from '../components/SectionBadge';
import { landingIcons } from '../components/icons';
import { showcaseItems } from '../landingData';

const toneClasses = {
    gold: 'border-[#B8792E] bg-[#E9D2B0] text-[#6F6877]',
    kraft: 'border-[#4B3D59] bg-[#EFE9F3] text-[#6F6877]',
    olive: 'border-[#ADC8B7] bg-[#EEF7F2] text-[#2E6856]',
    rose: 'border-[#FF9E92] bg-[#FFF0ED] text-[#FF705F]',
    wine: 'border-[#FF705F] bg-[#FF705F] text-[#FBF7ED]',
};

export function TemplateShowcaseSection() {
    return (
        <section
            className="relative overflow-hidden border-y border-[#C9BAD8] bg-[#DCD1E7] py-16 sm:py-20"
            id="templates"
        >
            <div className="torn-strip absolute inset-x-0 top-0 h-5 bg-[#E5DDED]" />
            <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <SectionBadge>Templates e recursos</SectionBadge>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-4xl">
                        Não é só uma página. É uma experiência de presente.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#6F6877]">
                        A landing já prepara a vitrine para templates reais: capa, carta, fotos, música, mapa afetivo e
                        páginas interativas.
                    </p>

                    <div className="relative mt-8 hidden max-w-sm lg:block">
                        <div className="absolute -left-8 top-14 h-28 w-24 -rotate-6 rounded-[6px] border border-[#C9A779] bg-[#FBF7ED] shadow-md" />
                        <PhoneMockup compact />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {showcaseItems.map((item) => {
                        const Icon = landingIcons[item.icon];

                        return (
                            <article
                                className="paper-texture group relative min-h-[210px] overflow-hidden rounded-[6px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_8px_0_#CFC1AE,0_18px_34px_#18102418] transition duration-200 hover:-translate-y-1 hover:rotate-[0.35deg] hover:shadow-[0_11px_0_#CFC1AE,0_24px_42px_#18102422] motion-reduce:transform-none"
                                key={item.title}
                            >
                                <span className="absolute -right-6 top-5 h-8 w-24 rotate-12 bg-[#C9A779]/70 shadow-sm" />
                                <div className="flex items-start justify-between gap-4">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 font-editorial text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${toneClasses[item.tone]}`}
                                    >
                                        {item.tag}
                                    </span>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A98BC4] bg-[#EFE9F3] text-[#FF705F]">
                                        <Icon aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                </div>
                                <h3 className="mt-8 text-xl font-semibold leading-snug text-[#181024]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#6F6877]">{item.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
