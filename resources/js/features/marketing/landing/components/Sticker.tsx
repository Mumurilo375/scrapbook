import type { ReactNode } from 'react';

type StickerProps = {
    children: ReactNode;
    className?: string;
    tone?: 'kraft' | 'rose' | 'gold' | 'olive' | 'wine';
};

const toneClasses = {
    gold: 'border-[#B8792E] bg-[#F2E1C8] text-[#6F6877]',
    kraft: 'border-[#8C645B] bg-[#C9A779] text-[#181024]',
    olive: 'border-[#73A58E] bg-[#E8F2ED] text-[#2E6856]',
    rose: 'border-[#FF705F] bg-[#FFF0ED] text-[#FF705F]',
    wine: 'border-[#FF705F] bg-[#FF705F] text-[#FBF7ED]',
};

export function Sticker({ children, className = '', tone = 'kraft' }: StickerProps) {
    return (
        <span
            className={`inline-flex items-center rounded-[3px] border px-3 py-1.5 font-hand text-lg leading-none shadow-[3px_5px_0_#CFC1AE,0_8px_16px_#1810241F] [clip-path:polygon(0_4%,98%_0,100%_92%,2%_100%)] ${toneClasses[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
