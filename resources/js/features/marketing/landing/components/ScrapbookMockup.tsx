import { Heart, Mail, Sparkles } from 'lucide-react';

import { PhoneMockup } from './PhoneMockup';
import { PolaroidCard } from './PolaroidCard';
import { Sticker } from './Sticker';

export function ScrapbookMockup() {
    return (
        <div className="relative mx-auto min-h-[520px] w-full max-w-[520px] sm:min-h-[600px]">
            <div className="absolute left-4 top-8 hidden h-24 w-36 -rotate-6 rounded-[6px] border border-[#83614F] bg-[#E8CFB4] p-4 shadow-md sm:block">
                <div className="h-2 w-16 rounded bg-[#D93632]" />
                <div className="mt-4 space-y-2">
                    <div className="h-1.5 rounded bg-[#AD7948]" />
                    <div className="h-1.5 w-3/4 rounded bg-[#B78D5C]" />
                    <div className="h-1.5 w-5/6 rounded bg-[#B78D5C]" />
                </div>
                <span className="absolute -top-3 left-8 h-6 w-16 rotate-3 bg-[#D2B28B]/80 shadow-sm" />
            </div>

            <div className="absolute right-0 top-10 z-10">
                <Sticker tone="rose" className="-rotate-3">
                    feito pra emocionar
                </Sticker>
            </div>

            <div className="absolute bottom-24 left-0 z-20 hidden sm:block">
                <PolaroidCard caption="favorita" rotate="left" tone="rose" />
            </div>

            <div className="absolute bottom-10 right-2 z-20">
                <PolaroidCard caption="nos dois" rotate="right" tone="olive" />
            </div>

            <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <PhoneMockup />
            </div>

            <div className="absolute bottom-0 left-1/2 w-[88%] -translate-x-1/2 rounded-[8px] border border-[#B78D5C] bg-[#AD7948] p-5 shadow-[0_22px_42px_#221C1933] sm:w-[420px]">
                <div className="relative rounded-[6px] border border-[#BD8558] bg-[#B78D5C] px-5 py-4 text-[#1F150A]">
                    <span className="absolute -top-4 right-10 h-7 w-20 -rotate-2 bg-[#D7B489]/80 shadow-sm" />
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7EE] text-[#D93632]">
                            <Mail aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="font-hand text-2xl leading-none">abre quando sentir saudade</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#42291D]">
                                envelope digital
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Heart
                aria-hidden="true"
                className="absolute left-8 top-56 h-7 w-7 -rotate-12 fill-[#E66F65] text-[#E66F65] sm:left-16"
            />
            <Sparkles aria-hidden="true" className="absolute right-12 top-64 h-6 w-6 text-[#BD8558]" />
        </div>
    );
}
