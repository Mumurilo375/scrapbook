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
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#3A2418] sm:text-4xl">
                        Um presente bonito sem virar um projeto complicado.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#6F4E37]">
                        A experiência guia você por etapas simples, mantendo o visual de scrapbook artesanal desde o
                        primeiro template.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {howItWorksSteps.map((step, index) => {
                        const Icon = landingIcons[step.icon];

                        return (
                            <PaperCard className="relative overflow-hidden p-5" key={step.title}>
                                <span className="absolute right-4 top-4 rounded-full border border-[#caa77d] bg-[#f3dfbd] px-3 py-1 font-editorial text-xs font-semibold text-[#6F4E37]">
                                    0{index + 1}
                                </span>
                                <div className="flex h-12 w-12 items-center justify-center rounded-[7px] border border-[#d8b98e] bg-[#f4e2c6] text-[#8E2F2F]">
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-[#3A2418]">{step.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#6F4E37]">{step.description}</p>
                            </PaperCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
