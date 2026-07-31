import { Check, Gift } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { pricingBenefits } from '../landingData';

export function PricingSection() {
    return (
        <section className="bg-[#DCD1E7] py-16 sm:py-20" id="preco">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <div>
                    <SectionBadge>Preço simples</SectionBadge>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-4xl">
                        Crie seu scrapbook digital a partir de R$ 4,99.
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#6F6877]">
                        Pagamento único, sem mensalidade. Um presente digital com visual caprichado, link exclusivo e QR
                        Code para entregar do seu jeito.
                    </p>
                </div>

                <PaperCard className="overflow-hidden p-0">
                    <div className="border-b border-[#C9BAD8] bg-[#FBF7ED] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D95045]">
                                    Presente digital
                                </p>
                                <p className="mt-2 font-display text-4xl font-bold tracking-[-0.03em] text-[#181024]">
                                    R$ 4,99
                                    <span className="ml-2 text-base font-medium text-[#6F6877]">inicial</span>
                                </p>
                            </div>
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF705F] text-[#FBF7ED]">
                                <Gift aria-hidden="true" className="h-6 w-6" />
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-3 p-6 sm:grid-cols-2">
                        {pricingBenefits.map((benefit) => (
                            <div className="flex items-start gap-3" key={benefit}>
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#73A58E] text-[#FBF7ED]">
                                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-sm leading-6 text-[#6F6877]">{benefit}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#C9BAD8] p-6">
                        <CTAButton className="w-full" href="/criar">
                            Criar meu presente
                        </CTAButton>
                    </div>
                </PaperCard>
            </div>
        </section>
    );
}
