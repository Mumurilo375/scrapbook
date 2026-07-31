import { Copy, RotateCcw, Share2, Undo2 } from 'lucide-react';
import { useState } from 'react';

import type { NormalizedThemeConfig } from '../../../components/renderer';
import { useAnalytics } from '../../../lib/analytics';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';
import { PublicGiftCta } from './PublicGiftCta';

type PublicGiftEndingProps = {
    createUrl: string;
    gift: ViewerGift;
    isPublic: boolean;
    motionEnabled: boolean;
    onBackToLastPage: () => void;
    onRestart: () => void;
    theme: NormalizedThemeConfig;
};

export function PublicGiftEnding({
    createUrl,
    gift,
    isPublic,
    motionEnabled,
    onBackToLastPage,
    onRestart,
    theme,
}: PublicGiftEndingProps) {
    const [feedback, setFeedback] = useState<string | null>(null);
    const { trackEvent } = useAnalytics();

    async function copyLink() {
        if (!isPublic || typeof window === 'undefined' || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(window.location.href);
        trackEvent('public_link_copied');
        setFeedback('Link copiado');
        window.setTimeout(() => setFeedback(null), 1800);
    }

    async function shareGift() {
        if (!isPublic || typeof window === 'undefined') {
            return;
        }

        if (navigator.share) {
            await navigator.share({
                title: gift.title,
                text: 'Olha este scrapbook que fizeram para você.',
                url: window.location.href,
            });
            trackEvent('share_clicked', {
                payload: {
                    method: 'native_share',
                },
            });

            return;
        }

        await copyLink();
        trackEvent('share_clicked', {
            payload: {
                method: 'copy_fallback',
            },
        });
    }

    return (
        <section
            className="gift-viewer-ending-transition mx-auto grid min-h-[calc(100dvh-150px)] w-full max-w-[980px] content-center gap-6 py-7 text-center"
            data-motion={motionEnabled ? 'on' : 'off'}
        >
            <div className="gift-ending-book relative mx-auto w-full">
                <div aria-hidden="true" className="gift-ending-book__pages" />
                <div className="gift-ending-book__cover">
                    <span aria-hidden="true" className="gift-ending-book__spine" />
                    <div className="gift-ending-book__note relative mx-auto" style={{ color: theme.tokens.colors.ink }}>
                        <span aria-hidden="true" className="gift-ending-book__tape" />
                        <p
                            className="font-hand text-4xl leading-none sm:text-5xl"
                            style={{ color: theme.tokens.colors.accent }}
                        >
                            até a próxima página
                        </p>
                        <h2 className="mx-auto mt-5 max-w-lg font-editorial text-2xl font-semibold leading-tight sm:text-4xl">
                            Essa história não termina aqui
                        </h2>
                        <p
                            className="mx-auto mt-4 max-w-md font-hand text-lg leading-7"
                            style={{ color: theme.tokens.colors.mutedInk }}
                        >
                            {gift.recipient_name ? `${gift.recipient_name}, ` : ''}
                            guarde este carinho por perto e volte quando a saudade pedir.
                        </p>

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <button
                                className="gift-viewer-action inline-flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-semibold"
                                onClick={onRestart}
                                style={{
                                    backgroundColor: theme.tokens.colors.accent,
                                    borderColor: theme.tokens.colors.accent,
                                    color: theme.tokens.colors.paper,
                                }}
                                type="button"
                            >
                                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                                Abrir outra vez
                            </button>
                            <button
                                className="gift-viewer-action inline-flex min-h-11 items-center justify-center gap-2 border border-[#8D788D] bg-[#FFFDF7] px-4 text-sm font-semibold text-[#2B2230]"
                                onClick={onBackToLastPage}
                                type="button"
                            >
                                <Undo2 aria-hidden="true" className="h-4 w-4" />
                                Ver última página
                            </button>
                        </div>

                        {isPublic ? (
                            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                                <button
                                    className="gift-viewer-action inline-flex min-h-10 items-center justify-center gap-2 border border-[#B5A8B6] bg-transparent px-3 text-sm font-semibold"
                                    onClick={copyLink}
                                    type="button"
                                >
                                    <Copy aria-hidden="true" className="h-4 w-4" />
                                    {feedback ?? 'Copiar link'}
                                </button>
                                <button
                                    className="gift-viewer-action inline-flex min-h-10 items-center justify-center gap-2 border border-[#B5A8B6] bg-transparent px-3 text-sm font-semibold"
                                    onClick={shareGift}
                                    type="button"
                                >
                                    <Share2 aria-hidden="true" className="h-4 w-4" />
                                    Compartilhar
                                </button>
                            </div>
                        ) : null}
                    </div>
                    <span aria-hidden="true" className="gift-ending-book__seal">
                        ♥
                    </span>
                </div>
            </div>

            {isPublic ? <PublicGiftCta createUrl={createUrl} theme={theme} /> : null}
        </section>
    );
}
