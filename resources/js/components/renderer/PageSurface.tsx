import type { CSSProperties, ReactNode } from 'react';

import type { Canvas } from '../../domain/canvas/schema';
import { resolveThemeColor, type NormalizedThemeConfig, type RendererContext } from './theme';

type PageSurfaceProps = {
    canvas: Canvas;
    children: ReactNode;
    context?: RendererContext;
    theme: NormalizedThemeConfig;
};

export function PageSurface({ canvas, children, context = 'preview', theme }: PageSurfaceProps) {
    const background = pageBackground(canvas, theme);
    const radius = Math.max(0, theme.page.borderRadius);
    const safeArea = canvas.artboard.safeArea;
    const showSafeArea = context === 'editor';
    const style = {
        backgroundColor: background,
        backgroundImage: surfaceTexture(theme),
        borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 42%, transparent)`,
        borderRadius: radiusFor(radius, theme.page.edge),
        boxShadow: shadowFor(theme.page.shadow, theme.tokens.colors.shadow),
        containerType: 'inline-size',
        '--scrap-paper': background,
        '--scrap-paper-alt': theme.tokens.colors.paperAlt,
        '--scrap-ink': theme.tokens.colors.ink,
        '--scrap-accent': theme.tokens.colors.accent,
        '--scrap-accent-soft': theme.tokens.colors.accentSoft,
        '--scrap-muted': theme.tokens.colors.muted,
        '--scrap-muted-ink': theme.tokens.colors.mutedInk,
        '--scrap-leaf': theme.tokens.colors.leaf,
        '--scrap-shadow': theme.tokens.colors.shadow,
    } as CSSProperties;

    return (
        <div
            className="relative h-full w-full overflow-hidden border"
            style={style}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(90deg, rgba(255,255,255,0.42), transparent 15%, transparent 86%, rgba(58,36,24,0.10)), linear-gradient(180deg, rgba(255,255,255,0.30), transparent 12%, transparent 85%, rgba(58,36,24,0.08))',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.36), inset 14px 0 24px rgba(58,36,24,0.08), inset -10px 0 22px rgba(58,36,24,0.05)',
                }}
            />
            {theme.page.decorations.paperGrain ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 mix-blend-multiply"
                    style={{ backgroundImage: grainTexture(theme), backgroundSize: '18px 18px, 23px 23px, 31px 31px', opacity: 0.42 }}
                />
            ) : null}
            {theme.page.decorations.subtleStains ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage: subtleOverlay(theme),
                        opacity: theme.page.texture === 'soft-confetti' ? 0.68 : 0.54,
                    }}
                />
            ) : null}
            {theme.page.decorations.edgeWear ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, rgba(58,36,24,0.13), transparent 2.2%, transparent 97%, rgba(58,36,24,0.10)), linear-gradient(180deg, rgba(58,36,24,0.09), transparent 2.5%, transparent 96%, rgba(58,36,24,0.14))',
                        opacity: 0.42,
                    }}
                />
            ) : null}
            {showSafeArea ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute border border-dashed"
                    style={{
                        borderColor: `color-mix(in srgb, ${theme.tokens.colors.accent} 32%, transparent)`,
                        bottom: `${toPercent(safeArea?.bottom ?? 0, canvas.artboard.height)}%`,
                        left: `${toPercent(safeArea?.left ?? 0, canvas.artboard.width)}%`,
                        right: `${toPercent(safeArea?.right ?? 0, canvas.artboard.width)}%`,
                        top: `${toPercent(safeArea?.top ?? 0, canvas.artboard.height)}%`,
                    }}
                />
            ) : null}
            <div className="relative h-full w-full">{children}</div>
        </div>
    );
}

function pageBackground(canvas: Canvas, theme: NormalizedThemeConfig): string {
    const artboardBackground = canvas.artboard.background;

    if (artboardBackground?.type === 'theme') {
        return theme.page.backgroundColor;
    }

    if (canvas.background?.color || canvas.background?.value) {
        return resolveThemeColor(theme, canvas.background.color ?? `var(--${canvas.background.value})`, theme.page.backgroundColor);
    }

    return theme.page.backgroundColor;
}

function shadowFor(shadow: string, color: string): string {
    if (shadow === 'none') {
        return 'none';
    }

    if (shadow === 'strong' || shadow === 'deep-paper') {
        return `0 34px 82px ${color}, 0 9px 18px rgba(58,36,24,0.16), inset 0 0 0 1px rgba(255,255,255,0.42)`;
    }

    if (shadow === 'pressed') {
        return '0 14px 28px rgba(58,36,24,0.16), inset 0 3px 14px rgba(58,36,24,0.12), inset 0 0 0 1px rgba(255,255,255,0.42)';
    }

    return `0 24px 54px ${color}, inset 0 0 0 1px rgba(255,255,255,0.54)`;
}

function radiusFor(radius: number, edge: string): string {
    if (edge === 'deckled' || edge === 'organic') {
        return `${radius + 12}px ${Math.max(10, radius - 4)}px ${radius + 4}px ${radius + 18}px`;
    }

    if (edge === 'journal') {
        return `${radius}px ${radius + 8}px ${radius + 8}px ${radius}px`;
    }

    return `${radius}px`;
}

function surfaceTexture(theme: NormalizedThemeConfig): string {
    if (theme.page.texture === 'linen') {
        return 'linear-gradient(90deg, rgba(255,255,255,0.20) 1px, transparent 1px), linear-gradient(0deg, rgba(58,36,24,0.05) 1px, transparent 1px), radial-gradient(circle at 28% 18%, rgba(255,255,255,0.38), transparent 22%)';
    }

    if (theme.page.texture === 'soft-petal') {
        return 'radial-gradient(circle at 18% 16%, rgba(255,255,255,0.46), transparent 18%), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--scrap-accent-soft) 28%, transparent), transparent 21%), linear-gradient(135deg, rgba(255,255,255,0.26), transparent 38%, color-mix(in srgb, var(--scrap-accent-soft) 16%, transparent)), linear-gradient(90deg, rgba(60,38,48,0.025) 1px, transparent 1px)';
    }

    if (theme.page.texture === 'soft-confetti') {
        return 'radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--scrap-accent) 22%, transparent) 0 1.2%, transparent 1.5%), radial-gradient(circle at 76% 22%, color-mix(in srgb, var(--scrap-muted) 34%, transparent) 0 1.1%, transparent 1.5%), radial-gradient(circle at 58% 78%, color-mix(in srgb, var(--scrap-accent-soft) 30%, transparent) 0 1.3%, transparent 1.8%), linear-gradient(135deg, rgba(255,255,255,0.42), transparent 36%, color-mix(in srgb, var(--scrap-muted) 10%, transparent))';
    }

    if (theme.page.texture === 'vintage-stains') {
        return 'radial-gradient(circle at 18% 22%, rgba(255,255,255,0.32), transparent 20%), radial-gradient(circle at 82% 74%, rgba(123,90,67,0.16), transparent 18%), linear-gradient(135deg, rgba(142,47,47,0.07), transparent 34%, rgba(110,124,79,0.08))';
    }

    if (theme.page.texture === 'botanical-fiber') {
        return 'radial-gradient(circle at 24% 16%, rgba(255,255,255,0.36), transparent 18%), linear-gradient(135deg, rgba(110,124,79,0.10), transparent 38%, rgba(217,166,161,0.08)), linear-gradient(90deg, rgba(58,36,24,0.035) 1px, transparent 1px)';
    }

    return 'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.38), transparent 18%), linear-gradient(135deg, rgba(142,47,47,0.08), transparent 34%, rgba(110,124,79,0.09)), linear-gradient(90deg, rgba(58,36,24,0.035) 1px, transparent 1px)';
}

function subtleOverlay(theme: NormalizedThemeConfig): string {
    if (theme.page.texture === 'soft-confetti') {
        return 'radial-gradient(circle at 22% 28%, color-mix(in srgb, var(--scrap-accent-soft) 38%, transparent) 0 2.4%, transparent 5.8%), radial-gradient(circle at 74% 64%, color-mix(in srgb, var(--scrap-muted) 26%, transparent) 0 2%, transparent 5.2%), linear-gradient(120deg, transparent 0 46%, color-mix(in srgb, var(--scrap-muted) 14%, transparent) 46% 47.4%, transparent 47.4%)';
    }

    if (theme.page.texture === 'soft-petal') {
        return 'radial-gradient(ellipse at 22% 20%, color-mix(in srgb, var(--scrap-accent-soft) 24%, transparent) 0 9%, transparent 24%), radial-gradient(ellipse at 78% 74%, color-mix(in srgb, var(--scrap-accent) 12%, transparent) 0 7%, transparent 22%), radial-gradient(ellipse at 44% 92%, rgba(76,38,48,0.07) 0 4%, transparent 18%)';
    }

    return 'radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--scrap-accent-soft) 30%, transparent) 0 9%, transparent 22%), radial-gradient(circle at 78% 70%, color-mix(in srgb, var(--scrap-muted) 22%, transparent) 0 7%, transparent 21%), radial-gradient(ellipse at 42% 92%, rgba(58,36,24,0.10) 0 4%, transparent 18%)';
}

function grainTexture(theme: NormalizedThemeConfig): string {
    const muted = theme.tokens.colors.muted;
    const ink = theme.tokens.colors.ink;

    return `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55) 1px, transparent 1.4px), radial-gradient(circle at 80% 30%, color-mix(in srgb, ${muted} 28%, transparent) 0.8px, transparent 1.2px), radial-gradient(circle at 35% 75%, color-mix(in srgb, ${ink} 14%, transparent) 0.8px, transparent 1.3px)`;
}

function toPercent(value: number, total: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
        return 0;
    }

    return (value / total) * 100;
}
