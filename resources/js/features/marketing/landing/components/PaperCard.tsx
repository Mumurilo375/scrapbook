import type { ReactNode } from 'react';

type PaperCardProps = {
    children: ReactNode;
    className?: string;
};

export function PaperCard({ children, className = '' }: PaperCardProps) {
    return (
        <div
            className={`paper-texture rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] shadow-[0_16px_40px_#221C1917] ${className}`}
        >
            {children}
        </div>
    );
}
