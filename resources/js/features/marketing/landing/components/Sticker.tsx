import type { ReactNode } from 'react';

type StickerProps = {
    children: ReactNode;
    className?: string;
    tone?: 'kraft' | 'rose' | 'gold' | 'olive' | 'wine';
};

const toneClasses = {
    gold: 'border-[#c99a4a] bg-[#f6deb0] text-[#5d3a1e]',
    kraft: 'border-[#a77b55] bg-[#d6b58d] text-[#3A2418]',
    olive: 'border-[#8D9A72] bg-[#e2e6d1] text-[#465234]',
    rose: 'border-[#C96F72] bg-[#f4d2cf] text-[#8E2F2F]',
    wine: 'border-[#8E2F2F] bg-[#8E2F2F] text-[#FFF8EC]',
};

export function Sticker({ children, className = '', tone = 'kraft' }: StickerProps) {
    return (
        <span
            className={`inline-flex items-center rounded-[6px] border px-3 py-1.5 font-hand text-lg leading-none shadow-[0_8px_16px_rgba(58,36,24,0.12)] ${toneClasses[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
