import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { landingIcons } from '../components/icons';
import { benefits } from '../landingData';

export function BenefitsSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <SectionBadge>Por que funciona</SectionBadge>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-4xl">
                        O carinho de um presente manual com a praticidade do digital.
                    </h2>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => {
                        const Icon = landingIcons[benefit.icon];

                        return (
                            <PaperCard className="p-5" key={benefit.title}>
                                <div className="flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#A98BC4] bg-[#EFE9F3] text-[#D95045]">
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 font-display text-lg font-bold text-[#181024]">{benefit.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#6F6877]">{benefit.description}</p>
                            </PaperCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
