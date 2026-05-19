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
            className="gift-viewer-opening-transition mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-[720px] content-center gap-7 py-8 text-center sm:min-h-[680px]"
            data-motion={motionEnabled ? 'on' : 'off'}
        >
            <div aria-hidden="true" className="gift-opening-book relative mx-auto h-44 w-60 sm:h-52 sm:w-72">
                <div
                    className="absolute inset-x-5 bottom-2 top-7 rotate-[-4deg] rounded-[8px] border shadow-xl"
                    style={{
                        backgroundColor: theme.tokens.colors.bookBackground,
                        borderColor: theme.tokens.colors.muted,
                        boxShadow: `0 22px 60px ${theme.tokens.colors.shadow}`,
                    }}
                />
                <div
                    className="absolute inset-x-8 bottom-5 top-2 rotate-[3deg] rounded-[8px] border"
                    style={{
                        backgroundColor: theme.tokens.colors.paperAlt,
                        borderColor: theme.tokens.colors.muted,
                    }}
                />
                <div
                    className="absolute inset-x-3 bottom-0 top-9 grid place-items-center rounded-[10px] border p-5 shadow-2xl"
                    style={{
                        backgroundColor: theme.tokens.colors.paper,
                        borderColor: theme.tokens.colors.muted,
                        color: theme.tokens.colors.accent,
                    }}
                >
                    <div
                        className="absolute left-8 top-[-10px] h-7 w-24 rotate-[-8deg] rounded-[3px] opacity-80"
                        style={{ backgroundColor: theme.tokens.colors.tape }}
                    />
                    <div
                        className="absolute bottom-4 right-7 h-6 w-20 rotate-[8deg] rounded-[3px] opacity-60"
                        style={{ backgroundColor: theme.tokens.colors.accentSoft }}
                    />
                    <Heart className="h-10 w-10" />
                </div>
            </div>

            <div className="grid gap-3">
                <p className="text-xs font-semibold uppercase" style={{ color: theme.tokens.colors.accent }}>
                    {mode === 'preview' ? 'Prévia do presente' : 'Você recebeu um scrapbook'}
                </p>
                <h1
                    className="font-editorial text-4xl font-semibold leading-tight sm:text-5xl"
                    style={{ color: theme.elements.text.headingColor }}
                >
                    {gift.title}
                </h1>
                <p
                    className="mx-auto max-w-md text-base font-semibold leading-7"
                    style={{ color: theme.tokens.colors.mutedInk }}
                >
                    {gift.recipient_name ? `Feito com carinho para ${gift.recipient_name}` : 'Feito com carinho'}
                    {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                </p>
            </div>

            <button
                className="gift-viewer-action mx-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border px-5 text-sm font-bold"
                onClick={onOpen}
                style={{
                    backgroundColor: theme.tokens.colors.accent,
                    borderColor: theme.tokens.colors.accent,
                    boxShadow: `0 16px 34px ${theme.tokens.colors.shadow}`,
                    color: theme.tokens.colors.paper,
                }}
                type="button"
            >
                <Gift aria-hidden="true" className="h-4 w-4" />
                Abrir presente
            </button>

            <p
                className="mx-auto inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: theme.tokens.colors.mutedInk }}
            >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Uma página de cada vez
            </p>
        </section>
    );
}
