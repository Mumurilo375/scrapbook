import { Head, Link } from '@inertiajs/react';
import { Heart } from 'lucide-react';

import { GiftViewerLayout } from '../../gifts/components/viewer/GiftViewerLayout';
import { GiftViewerStage } from '../../gifts/components/viewer/GiftViewerStage';
import { GiftViewerTopBar } from '../../gifts/components/viewer/GiftViewerTopBar';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';

type PublicGiftShowProps = {
    gift: ViewerGift;
};

export default function PublicGiftShow({ gift }: PublicGiftShowProps) {
    return (
        <>
            <Head title={gift.title}>
                <meta content="noindex,nofollow" name="robots" />
            </Head>
            <GiftViewerLayout>
                <GiftViewerTopBar createUrl={gift.urls.create} mode="public" title={gift.title} />
                <section className="mx-auto mt-8 grid w-full max-w-[680px] gap-3 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                        <Heart aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold uppercase text-[#7A2634]">Você recebeu um presente</p>
                    <h1 className="font-editorial text-4xl font-semibold text-[#1F150A] sm:text-5xl">{gift.title}</h1>
                    <p className="text-sm font-semibold text-[#6F5A4A]">
                        {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Feito com carinho'}
                        {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                    </p>
                    <Link
                        className="mx-auto mt-2 inline-flex min-h-10 items-center rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-4 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                        href={gift.urls.create}
                    >
                        Criar o meu também
                    </Link>
                </section>
                <GiftViewerStage gift={gift} showHeader={false} />
            </GiftViewerLayout>
        </>
    );
}
