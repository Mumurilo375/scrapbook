import { Gift, Heart, Sparkles } from 'lucide-react';

import type { NormalizedThemeConfig } from '../../../components/renderer';
import type { ViewerGift } from '../../gifts/components/viewer/viewerTypes';

type PublicGiftOpeningProps = {
    gift: ViewerGift;
    mode: 'preview' | 'public';
    motionEnabled: boolean;
    onOpen: () => void;
    theme: NormalizedThemeConfig;
};

export function PublicGiftOpening({ gift, mode, motionEnabled, onOpen, theme }: PublicGiftOpeningProps) {
    return (
        <section
            className="gift-viewer-opening-transition mx-auto grid min-h-[calc(100dvh-92px)] w-full max-w-[1180px] content-center gap-5 py-6 text-center"
            data-motion={motionEnabled ? 'on' : 'off'}
        >
            <div className="gift-opening-scene">
                <div aria-hidden="true" className="gift-opening-scene__shadow" />
                <div aria-hidden="true" className="gift-opening-book relative mx-auto">
                    <div className="gift-opening-book__pages" />
                    <div className="gift-opening-book__cover">
                        <span className="gift-opening-book__spine" />
                        <span className="gift-opening-book__corner gift-opening-book__corner--top" />
                        <span className="gift-opening-book__corner gift-opening-book__corner--bottom" />
                        <div className="gift-opening-book__label">
                            <span className="gift-opening-book__tape" />
                            <Heart className="mx-auto h-8 w-8 text-[#B54C58]" />
                            <p className="mt-2 text-[10px] font-bold tracking-[0.18em] text-[#8C5A4D] uppercase">
                                coleção afetiva
                            </p>
                            <p className="mt-2 line-clamp-2 font-hand text-3xl leading-[0.95] text-[#251D26] sm:text-5xl">
                                {gift.title}
                            </p>
                            <p className="mt-3 font-editorial text-xs text-[#6B5A50] sm:text-sm">
                                {gift.recipient_name ? `para ${gift.recipient_name}` : 'feito com carinho'}
                                {gift.sender_name ? ` · de ${gift.sender_name}` : ''}
                            </p>
                        </div>
                        <span className="gift-opening-book__pressed-flower">
                            <i />
                            <i />
                            <i />
                            <i />
                        </span>
                        <span className="gift-opening-book__ticket">guarde estas memórias</span>
                        <span className="gift-opening-book__clasp" />
                    </div>
                </div>
            </div>

            <div className="grid gap-3">
                <p
                    className="text-[10px] font-bold tracking-[0.18em] uppercase"
                    style={{ color: theme.tokens.colors.accent }}
                >
                    {mode === 'preview' ? 'Prévia do presente' : 'Você recebeu um scrapbook'}
                </p>
                <p
                    className="mx-auto max-w-md font-hand text-xl leading-6"
                    style={{ color: theme.tokens.colors.mutedInk }}
                >
                    Há uma história feita à mão esperando por você.
                </p>
            </div>

            <button
                className="gift-viewer-action gift-opening-action mx-auto inline-flex min-h-12 items-center justify-center gap-2 border px-6 text-sm font-bold"
                onClick={onOpen}
                style={{
                    backgroundColor: theme.tokens.colors.accent,
                    borderColor: `color-mix(in srgb, ${theme.tokens.colors.accent} 72%, black)`,
                    boxShadow: `0 5px 0 color-mix(in srgb, ${theme.tokens.colors.accent} 76%, black), 0 18px 34px ${theme.tokens.colors.shadow}`,
                    color: theme.tokens.colors.paper,
                }}
                type="button"
            >
                <Gift aria-hidden="true" className="h-4 w-4" />
                Abrir presente
            </button>

            <p
                className="mx-auto inline-flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase"
                style={{ color: theme.tokens.colors.mutedInk }}
            >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                clique, deslize ou use as setas
            </p>
        </section>
    );
}
