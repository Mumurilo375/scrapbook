import { Link } from '@inertiajs/react';
import { Gift } from 'lucide-react';

import type { NormalizedThemeConfig } from '../../../components/renderer';
import { useAnalytics } from '../../../lib/analytics';

type PublicGiftCtaProps = {
    createUrl: string;
    theme: NormalizedThemeConfig;
    compact?: boolean;
};

export function PublicGiftCta({ compact = false, createUrl, theme }: PublicGiftCtaProps) {
    const { trackEvent } = useAnalytics();

    return (
        <Link
            className={`gift-viewer-action inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-semibold ${
                compact ? 'mx-auto' : ''
            }`}
            href={createUrl}
            onClick={() => trackEvent('create_my_own_clicked')}
            style={{
                backgroundColor: compact ? 'transparent' : theme.tokens.colors.paper,
                borderColor: theme.tokens.colors.muted,
                color: theme.tokens.colors.ink,
                boxShadow: compact ? undefined : `0 10px 24px ${theme.tokens.colors.shadow}`,
            }}
        >
            <Gift aria-hidden="true" className="h-4 w-4" />
            {compact ? 'Fazer um scrapbook como este' : 'Criar o meu também'}
        </Link>
    );
}
