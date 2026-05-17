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
        'border-[#8F211F] bg-[#D93632] text-[#FFF7EE] shadow-[0_14px_30px_#221C1938] hover:bg-[#B92827]',
    secondary: 'border-[#B78D5C] bg-[#FFF7EE] text-[#1F150A] hover:bg-[#EFE0CF]',
    light: 'border-[#E8CCAD] bg-[#FFF7EE] text-[#1F150A] hover:bg-white',
};

export function CTAButton({ children, href, variant = 'primary', icon = 'arrow', className = '' }: CTAButtonProps) {
    const Icon = icon === 'play' ? PlayCircle : ArrowRight;

    return (
        <a
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D93632] sm:px-6 ${variantClasses[variant]} ${className}`}
            href={href}
        >
            <span>{children}</span>
            {icon !== 'none' && <Icon aria-hidden="true" className="h-4 w-4" />}
        </a>
    );
}
