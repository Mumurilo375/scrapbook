import { Copy, RotateCcw, Share2, Undo2 } from 'lucide-react';
import { useState } from 'react';

import type { NormalizedThemeConfig } from '../../../components/renderer';
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

    async function copyLink() {
        if (!isPublic || typeof window === 'undefined' || !navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(window.location.href);
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

            return;
        }

        await copyLink();
    }

    return (
        <section
            className="gift-viewer-ending-transition mx-auto grid w-full max-w-[720px] gap-6 py-8 text-center"
            data-motion={motionEnabled ? 'on' : 'off'}
        >
            <div
                className="paper-grain relative overflow-hidden rounded-[10px] border px-5 py-10 shadow-2xl sm:px-10"
                style={{
                    backgroundColor: theme.tokens.colors.paper,
                    borderColor: theme.tokens.colors.muted,
                    boxShadow: `0 24px 70px ${theme.tokens.colors.shadow}`,
                    color: theme.tokens.colors.ink,
                }}
            >
                <div
                    aria-hidden="true"
                    className="absolute left-10 top-[-10px] h-8 w-28 rotate-[-6deg] rounded-[3px] opacity-75"
                    style={{ backgroundColor: theme.tokens.colors.tape }}
                />
                <div
                    aria-hidden="true"
                    className="absolute bottom-5 right-9 h-7 w-24 rotate-[7deg] rounded-[3px] opacity-50"
                    style={{ backgroundColor: theme.tokens.colors.accentSoft }}
                />

                <p
                    className="font-hand text-4xl leading-none sm:text-5xl"
                    style={{ color: theme.tokens.colors.accent }}
                >
                    Fim deste scrapbook
                </p>
                <h2 className="mx-auto mt-5 max-w-lg font-editorial text-3xl font-semibold leading-tight sm:text-4xl">
                    Mas essa história ainda continua
                </h2>
                <p
                    className="mx-auto mt-4 max-w-md text-sm font-semibold leading-7"
                    style={{ color: theme.tokens.colors.mutedInk }}
                >
                    {gift.recipient_name ? `${gift.recipient_name}, ` : ''}
                    guarde este carinho por perto e volte quando quiser.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        className="gift-viewer-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border px-4 text-sm font-semibold"
                        onClick={onRestart}
                        style={{
                            backgroundColor: theme.tokens.colors.accent,
                            borderColor: theme.tokens.colors.accent,
                            color: theme.tokens.colors.paper,
                        }}
                        type="button"
                    >
                        <RotateCcw aria-hidden="true" className="h-4 w-4" />
                        Voltar ao início
                    </button>
                    <button
                        className="gift-viewer-action inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border px-4 text-sm font-semibold"
                        onClick={onBackToLastPage}
                        style={{
                            backgroundColor: theme.tokens.colors.paper,
                            borderColor: theme.tokens.colors.muted,
                            color: theme.tokens.colors.ink,
                        }}
                        type="button"
                    >
                        <Undo2 aria-hidden="true" className="h-4 w-4" />
                        Ver última página
                    </button>
                </div>

                {isPublic ? (
                    <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                        <button
                            className="gift-viewer-action inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-semibold"
                            onClick={copyLink}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: theme.tokens.colors.muted,
                                color: theme.tokens.colors.ink,
                            }}
                            type="button"
                        >
                            <Copy aria-hidden="true" className="h-4 w-4" />
                            {feedback ?? 'Copiar link'}
                        </button>
                        <button
                            className="gift-viewer-action inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-semibold"
                            onClick={shareGift}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: theme.tokens.colors.muted,
                                color: theme.tokens.colors.ink,
                            }}
                            type="button"
                        >
                            <Share2 aria-hidden="true" className="h-4 w-4" />
                            Compartilhar
                        </button>
                    </div>
                ) : null}
            </div>

            {isPublic ? <PublicGiftCta createUrl={createUrl} theme={theme} /> : null}
        </section>
    );
}
