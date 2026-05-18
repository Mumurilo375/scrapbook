import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';

import { normalizeThemeConfig } from '../../../components/renderer';
import { GiftViewerLayout } from '../../gifts/components/viewer/GiftViewerLayout';
import { GiftViewerStage } from '../../gifts/components/viewer/GiftViewerStage';
import { GiftViewerTopBar } from '../../gifts/components/viewer/GiftViewerTopBar';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';

type PublicGiftShowProps = {
    gift: ViewerGift;
};

export default function PublicGiftShow({ gift }: PublicGiftShowProps) {
    const theme = normalizeThemeConfig(gift.theme?.config);

    return (
        <>
            <Head title={gift.title}>
                <meta content="noindex,nofollow" name="robots" />
            </Head>
            <GiftViewerLayout theme={gift.theme?.config}>
                <GiftViewerTopBar createUrl={gift.urls.create} mode="public" title={gift.title} />
                <section className="mx-auto mt-8 grid w-full max-w-[680px] gap-3 text-center">
                    <div
                        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border"
                        style={{
                            backgroundColor: theme.tokens.colors.paper,
                            borderColor: theme.tokens.colors.muted,
                            color: theme.tokens.colors.accent,
                        }}
                    >
                        <Heart aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold uppercase" style={{ color: theme.tokens.colors.accent }}>Você recebeu um presente</p>
                    <h1 className="font-editorial text-4xl font-semibold sm:text-5xl" style={{ color: theme.elements.text.headingColor }}>{gift.title}</h1>
                    <p className="text-sm font-semibold" style={{ color: theme.tokens.colors.mutedInk }}>
                        {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Feito com carinho'}
                        {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                    </p>
                    <Link
                        className="mx-auto mt-2 inline-flex min-h-10 items-center rounded-[6px] border px-4 text-sm font-semibold"
                        href={gift.urls.create}
                        style={{
                            backgroundColor: theme.tokens.colors.paper,
                            borderColor: theme.tokens.colors.muted,
                            color: theme.tokens.colors.ink,
                        }}
                    >
                        Criar o meu também
                    </Link>
                </section>
                <GiftViewerStage context="public" gift={gift} showHeader={false} />
            </GiftViewerLayout>
        </>
    );
}
