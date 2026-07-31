import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { landingIcons } from '../components/icons';
import { howItWorksSteps } from '../landingData';

export function HowItWorksSection() {
    return (
        <section className="py-16 sm:py-20" id="como-funciona">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <SectionBadge>Como funciona</SectionBadge>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-4xl">
                        Um presente bonito sem virar um projeto complicado.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#6F6877]">
                        A experiência guia você por etapas simples, mantendo o visual de scrapbook artesanal desde o
                        primeiro template.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {howItWorksSteps.map((step, index) => {
                        const Icon = landingIcons[step.icon];

                        return (
                            <PaperCard className="relative overflow-hidden p-5" key={step.title}>
                                <span className="absolute right-4 top-4 rounded-[4px] border border-[#A98BC4] bg-[#F3EFF6] px-3 py-1 text-xs font-bold text-[#4B3D59]">
                                    0{index + 1}
                                </span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-[4px] border border-[#A98BC4] bg-[#EFE9F3] text-[#D95045]">
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 font-display text-lg font-bold text-[#181024]">{step.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#6F6877]">{step.description}</p>
                            </PaperCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
