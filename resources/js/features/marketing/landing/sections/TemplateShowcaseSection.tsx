import { PhoneMockup } from '../components/PhoneMockup';
import { SectionBadge } from '../components/SectionBadge';
import { landingIcons } from '../components/icons';
import { showcaseItems } from '../landingData';

const toneClasses = {
    gold: 'border-[#BD8558] bg-[#E4C196] text-[#42291D]',
    kraft: 'border-[#B78D5C] bg-[#EAD2B8] text-[#42291D]',
    olive: 'border-[#B8C0A1] bg-[#EEF0E0] text-[#536342]',
    rose: 'border-[#E99B94] bg-[#F8D8D3] text-[#D93632]',
    wine: 'border-[#D93632] bg-[#D93632] text-[#FFF7EE]',
};

export function TemplateShowcaseSection() {
    return (
        <section className="relative overflow-hidden bg-[#E8D3BB] py-16 sm:py-20" id="templates">
            <div className="torn-strip absolute inset-x-0 top-0 h-5 bg-[#F4E8D9]" />
            <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-5 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                <div className="lg:sticky lg:top-28 lg:self-start">
                    <SectionBadge>Templates e recursos</SectionBadge>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F150A] sm:text-4xl">
                        Não é só uma página. É uma experiência de presente.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#42291D]">
                        A landing já prepara a vitrine para templates reais: capa, carta, fotos, música, mapa afetivo e
                        páginas interativas.
                    </p>

                    <div className="relative mt-8 hidden max-w-sm lg:block">
                        <div className="absolute -left-8 top-14 h-28 w-24 -rotate-6 rounded-[6px] border border-[#C49A70] bg-[#FFF7EE] shadow-md" />
                        <PhoneMockup compact />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {showcaseItems.map((item) => {
                        const Icon = landingIcons[item.icon];

                        return (
                            <article
                                className="paper-texture group relative min-h-[210px] overflow-hidden rounded-[8px] border border-[#CBA980] bg-[#FFF7EE] p-5 shadow-[0_14px_34px_#221C1914] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_42px_#221C1921]"
                                key={item.title}
                            >
                                <span className="absolute -right-6 top-5 h-8 w-24 rotate-12 bg-[#C49A70]/70 shadow-sm" />
                                <div className="flex items-start justify-between gap-4">
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 font-editorial text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${toneClasses[item.tone]}`}
                                    >
                                        {item.tag}
                                    </span>
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#CBA980] bg-[#EAD2B8] text-[#D93632]">
                                        <Icon aria-hidden="true" className="h-5 w-5" />
                                    </span>
                                </div>
                                <h3 className="mt-8 text-xl font-semibold leading-snug text-[#1F150A]">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#42291D]">{item.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
