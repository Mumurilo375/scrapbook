import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type SectionBadgeProps = {
    children: ReactNode;
    tone?: 'light' | 'dark';
};

export function SectionBadge({ children, tone = 'light' }: SectionBadgeProps) {
    const toneClasses =
        tone === 'dark'
            ? 'border-[#A98BC4] bg-[#281D36] text-[#FBF7ED]'
            : 'border-[#A98BC4] bg-[#FBF7ED] text-[#181024]';

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] shadow-[2px_3px_0_#CFC1AE] [clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,0_100%)] ${toneClasses}`}
        >
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            {children}
        </span>
    );
}
