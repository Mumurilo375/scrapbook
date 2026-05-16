import type { ReactNode } from 'react';

type PaperCardProps = {
    children: ReactNode;
    className?: string;
};

export function PaperCard({ children, className = '' }: PaperCardProps) {
    return (
        <div
            className={`paper-texture rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] shadow-[0_16px_40px_rgba(58,36,24,0.09)] ${className}`}
        >
            {children}
        </div>
    );
}
