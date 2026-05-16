import { ArrowRight, PlayCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type CTAButtonProps = {
    children: ReactNode;
    href: string;
    variant?: 'primary' | 'secondary' | 'light';
    icon?: 'arrow' | 'play' | 'none';
    className?: string;
};

const variantClasses = {
    primary:
        'border-[#5f2c24] bg-[#8E2F2F] text-[#FFF8EC] shadow-[0_14px_30px_rgba(58,36,24,0.22)] hover:bg-[#742727]',
    secondary: 'border-[#9b7657] bg-[#FFF8EC] text-[#3A2418] hover:bg-[#f4e5d2]',
    light: 'border-[#f1d7b6] bg-[#FFF8EC] text-[#3A2418] hover:bg-white',
};

export function CTAButton({ children, href, variant = 'primary', icon = 'arrow', className = '' }: CTAButtonProps) {
    const Icon = icon === 'play' ? PlayCircle : ArrowRight;

    return (
        <a
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8E2F2F] sm:px-6 ${variantClasses[variant]} ${className}`}
            href={href}
        >
            <span>{children}</span>
            {icon !== 'none' && <Icon aria-hidden="true" className="h-4 w-4" />}
        </a>
    );
}
