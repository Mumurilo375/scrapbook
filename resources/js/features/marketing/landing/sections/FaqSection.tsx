import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { SectionBadge } from '../components/SectionBadge';
import { faqs } from '../landingData';

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="py-16 sm:py-20" id="faq">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
                <div>
                    <SectionBadge>FAQ</SectionBadge>
                    <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#181024] sm:text-4xl">
                        Perguntas antes de transformar memória em presente.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[#6F6877]">
                        A proposta é manter a criação simples, bonita e clara antes de qualquer pagamento.
                    </p>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        const panelId = `faq-panel-${index}`;

                        return (
                            <div
                                className="border-b border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_5px_0_#CFC1AE]"
                                key={faq.question}
                            >
                                <button
                                    aria-controls={panelId}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-bold text-[#181024]"
                                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                                    type="button"
                                >
                                    <span>{faq.question}</span>
                                    <ChevronDown
                                        aria-hidden="true"
                                        className={`h-5 w-5 shrink-0 text-[#FF705F] transition ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <div className={isOpen ? 'block' : 'hidden'} id={panelId}>
                                    <p className="border-t border-[#D6CFDD] px-5 pb-5 pt-4 text-sm leading-7 text-[#6F6877]">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
