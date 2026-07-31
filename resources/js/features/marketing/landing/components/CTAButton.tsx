import { ArrowRight, PlayCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { useAnalytics } from '../../../../lib/analytics';

type CTAButtonProps = {
    children: ReactNode;
    href: string;
    variant?: 'primary' | 'secondary' | 'light';
    icon?: 'arrow' | 'play' | 'none';
    className?: string;
};

const variantClasses = {
    primary:
        'border-[#FF8E80] bg-[#FF705F] text-[#181024] shadow-[inset_0_-2px_0_#D95045,0_12px_24px_#18102424] hover:bg-[#FF8273]',
    secondary: 'border-[#4B3D59] bg-transparent text-[#181024] hover:bg-[#F3EFF6]',
    light: 'border-[#C9BAD8] bg-[#FBF7ED] text-[#181024] hover:bg-white',
};

export function CTAButton({ children, href, variant = 'primary', icon = 'arrow', className = '' }: CTAButtonProps) {
    const Icon = icon === 'play' ? PlayCircle : ArrowRight;
    const { trackEvent } = useAnalytics();

    function trackClick() {
        if (href.startsWith('/demo')) {
            trackEvent('demo_cta_clicked', { payload: { surface: 'landing' } });

            return;
        }

        if (href.startsWith('/criar')) {
            trackEvent('landing_cta_clicked', { payload: { surface: 'landing' } });
        }
    }

    return (
        <a
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] border px-5 py-3 text-sm font-bold transition duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#FF705F] motion-reduce:transform-none sm:px-6 ${variantClasses[variant]} ${className}`}
            href={href}
            onClick={trackClick}
        >
            <span>{children}</span>
            {icon !== 'none' && <Icon aria-hidden="true" className="h-4 w-4" />}
        </a>
    );
}
