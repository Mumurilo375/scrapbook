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
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F150A] sm:text-4xl">
                        O carinho de um presente manual com a praticidade do digital.
                    </h2>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((benefit) => {
                        const Icon = landingIcons[benefit.icon];

                        return (
                            <PaperCard className="p-5" key={benefit.title}>
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CBA980] bg-[#EAD2B8] text-[#D93632]">
                                    <Icon aria-hidden="true" className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-[#1F150A]">{benefit.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#42291D]">{benefit.description}</p>
                            </PaperCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
