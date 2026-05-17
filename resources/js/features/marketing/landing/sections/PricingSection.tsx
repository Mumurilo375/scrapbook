import { Check, Gift } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { pricingBenefits } from '../landingData';

export function PricingSection() {
    return (
        <section className="bg-[#E8D3BB] py-16 sm:py-20" id="preco">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <div>
                    <SectionBadge>Preço simples</SectionBadge>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F150A] sm:text-4xl">
                        Crie seu scrapbook digital a partir de R$ 4,99.
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#42291D]">
                        Pagamento único, sem mensalidade. Um presente digital com visual caprichado, link exclusivo e
                        QR Code para entregar do seu jeito.
                    </p>
                </div>

                <PaperCard className="overflow-hidden p-0">
                    <div className="border-b border-[#D8B991] bg-[#FFF7EE] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#D93632]">
                                    Presente digital
                                </p>
                                <p className="mt-2 text-4xl font-semibold text-[#1F150A]">
                                    R$ 4,99
                                    <span className="ml-2 text-base font-medium text-[#42291D]">inicial</span>
                                </p>
                            </div>
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D93632] text-[#FFF7EE]">
                                <Gift aria-hidden="true" className="h-6 w-6" />
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-3 p-6 sm:grid-cols-2">
                        {pricingBenefits.map((benefit) => (
                            <div className="flex items-start gap-3" key={benefit}>
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7E8F68] text-[#FFF7EE]">
                                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-sm leading-6 text-[#42291D]">{benefit}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#D8B991] p-6">
                        <CTAButton className="w-full" href="/criar">
                            Criar meu presente
                        </CTAButton>
                    </div>
                </PaperCard>
            </div>
        </section>
    );
}
