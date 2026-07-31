import type { ReactNode } from 'react';

type PaperCardProps = {
    children: ReactNode;
    className?: string;
};

export function PaperCard({ children, className = '' }: PaperCardProps) {
    return (
        <div
            className={`paper-texture relative isolate overflow-hidden rounded-[8px] border border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_12px_0_#CFC1AE,0_20px_38px_#18102418] ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                backgroundPosition: 'center',
                backgroundSize: 'auto, 420px 420px',
            }}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 -z-10 h-7 w-7 bg-[#E5DDED] [clip-path:polygon(100%_0,100%_100%,0_0)]"
            />
            {children}
        </div>
    );
}
