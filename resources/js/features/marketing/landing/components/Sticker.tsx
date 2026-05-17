import type { ReactNode } from 'react';

type StickerProps = {
    children: ReactNode;
    className?: string;
    tone?: 'kraft' | 'rose' | 'gold' | 'olive' | 'wine';
};

const toneClasses = {
    gold: 'border-[#BD8558] bg-[#EBC493] text-[#42291D]',
    kraft: 'border-[#AD7948] bg-[#C49A70] text-[#1F150A]',
    olive: 'border-[#7E8F68] bg-[#E7EBD8] text-[#48573A]',
    rose: 'border-[#E66F65] bg-[#F8D8D3] text-[#D93632]',
    wine: 'border-[#D93632] bg-[#D93632] text-[#FFF7EE]',
};

export function Sticker({ children, className = '', tone = 'kraft' }: StickerProps) {
    return (
        <span
            className={`inline-flex items-center rounded-[6px] border px-3 py-1.5 font-hand text-lg leading-none shadow-[0_8px_16px_#221C191F] ${toneClasses[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
