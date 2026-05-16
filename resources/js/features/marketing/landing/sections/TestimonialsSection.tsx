import { Quote, Star } from 'lucide-react';

import { PaperCard } from '../components/PaperCard';
import { SectionBadge } from '../components/SectionBadge';
import { testimonials } from '../landingData';

export function TestimonialsSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <SectionBadge>Depoimentos</SectionBadge>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#3A2418] sm:text-4xl">
                        Presentes pequenos que parecem enormes para quem recebe.
                    </h2>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {testimonials.map((testimonial) => (
                        <PaperCard className="relative p-5" key={testimonial.name}>
                            <Quote aria-hidden="true" className="absolute right-5 top-5 h-7 w-7 text-[#C96F72]/40" />
                            <div className="flex gap-1 text-[#C99A4A]" aria-label="Cinco estrelas">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <Star aria-hidden="true" className="h-4 w-4 fill-current" key={index} />
                                ))}
                            </div>
                            <p className="mt-5 text-base leading-7 text-[#3A2418]">"{testimonial.quote}"</p>
                            <div className="mt-6 flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8b98e] bg-[#f4e2c6] font-editorial text-sm font-semibold text-[#8E2F2F]">
                                    {testimonial.initials}
                                </span>
                                <div>
                                    <p className="font-semibold text-[#3A2418]">{testimonial.name}</p>
                                    <p className="text-sm text-[#6F4E37]">{testimonial.context}</p>
                                </div>
                            </div>
                        </PaperCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
