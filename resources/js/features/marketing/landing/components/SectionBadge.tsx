import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

type SectionBadgeProps = {
    children: ReactNode;
    tone?: 'light' | 'dark';
};

export function SectionBadge({ children, tone = 'light' }: SectionBadgeProps) {
    const toneClasses =
        tone === 'dark'
            ? 'border-[#BD8558] bg-[#42291D] text-[#FFF7EE]'
            : 'border-[#C49A70] bg-[#E8D3BB] text-[#42291D]';

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-editorial text-[0.72rem] font-semibold uppercase tracking-[0.14em] ${toneClasses}`}
        >
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            {children}
        </span>
    );
}
