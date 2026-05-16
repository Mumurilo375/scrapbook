import { Check, Gift } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { pricingBenefits } from '../landingData';

export function PricingSection() {
    return (
        <section className="bg-[#efe1cd] py-16 sm:py-20" id="preco">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <div>
                    <SectionBadge>Preço simples</SectionBadge>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#3A2418] sm:text-4xl">
                        Crie seu scrapbook digital a partir de R$ 4,99.
                    </h2>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[#6F4E37]">
                        Pagamento único, sem mensalidade. Um presente digital com visual caprichado, link exclusivo e
                        QR Code para entregar do seu jeito.
                    </p>
                </div>

                <PaperCard className="overflow-hidden p-0">
                    <div className="border-b border-[#dfc7a7] bg-[#FFF8EC] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#8E2F2F]">
                                    Presente digital
                                </p>
                                <p className="mt-2 text-4xl font-semibold text-[#3A2418]">
                                    R$ 4,99
                                    <span className="ml-2 text-base font-medium text-[#6F4E37]">inicial</span>
                                </p>
                            </div>
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#8E2F2F] text-[#FFF8EC]">
                                <Gift aria-hidden="true" className="h-6 w-6" />
                            </span>
                        </div>
                    </div>
                    <div className="grid gap-3 p-6 sm:grid-cols-2">
                        {pricingBenefits.map((benefit) => (
                            <div className="flex items-start gap-3" key={benefit}>
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8D9A72] text-[#FFF8EC]">
                                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-sm leading-6 text-[#6F4E37]">{benefit}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#dfc7a7] p-6">
                        <CTAButton className="w-full" href="#topo">
                            Criar meu presente
                        </CTAButton>
                    </div>
                </PaperCard>
            </div>
        </section>
    );
}
