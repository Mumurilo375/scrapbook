import {
    useEffect,
    useState,
    type CSSProperties,
    type MouseEvent,
    type PointerEvent,
    type ReactNode,
    type TouchEvent,
} from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import { useAnalytics } from '../../lib/analytics';
import { isRecord, type NormalizedThemeConfig, type RendererContext } from './theme';

type InteractiveElementProps = {
    element: CanvasElement;
    context?: RendererContext;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

type EnvelopeVariant = 'cream' | 'kraft' | 'rose';

export function InteractiveElement({ context = 'preview', element, style, theme }: InteractiveElementProps) {
    if (element.type === 'interactive_envelope') {
        return <InteractiveEnvelopeElement context={context} element={element} style={style} theme={theme} />;
    }

    if (element.type === 'flip_polaroid') {
        return <FlipPolaroidElement context={context} element={element} style={style} theme={theme} />;
    }

    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <button
            className="absolute rounded-[10px] border px-3 font-semibold"
            style={{
                ...style,
                backgroundColor: theme.tokens.colors.paperAlt,
                borderColor: theme.tokens.colors.muted,
                color: theme.tokens.colors.ink,
                fontSize: '3cqw',
            }}
            type="button"
        >
            {label}
        </button>
    );
}

function InteractiveEnvelopeElement({
    context,
    element,
    style,
    theme,
}: InteractiveElementProps & { context: RendererContext }) {
    const reducedMotion = usePrefersReducedMotion();
    const { trackEvent } = useAnalytics();
    const record = element as CanvasElement & Record<string, unknown>;
    const state = isRecord(record.state) ? record.state : {};
    const elementStyle = isRecord(record.style) ? record.style : {};
    const defaultOpen = state.defaultOpen === true;
    const [open, setOpen] = useState(defaultOpen);
    const title = textValue(record.title, 'Abra quando sentir saudade');
    const content = textValue(record.content, 'Escreva aqui uma cartinha especial.');
    const variant = envelopeVariant(elementStyle.variant);
    const palette = envelopePalette(variant, theme);
    const interactive = context !== 'editor';
    const rootStyle: CSSProperties = {
        ...style,
        color: theme.tokens.colors.ink,
        perspective: reducedMotion ? undefined : '1200px',
        pointerEvents: interactive ? 'auto' : 'none',
    };
    const openClass = open ? 'is-open' : '';
    const motionClass = reducedMotion ? 'transition-none' : 'transition duration-300 ease-out';

    const body = (
        <div
            className={`scrapbook-envelope relative h-full w-full overflow-visible ${openClass}`}
            style={{
                filter: `drop-shadow(0 4px 3px rgba(58,36,24,0.16)) drop-shadow(0 18px 24px ${theme.tokens.colors.shadow})`,
            }}
        >
            <div
                className={`scrapbook-envelope__letter absolute left-[8%] right-[8%] top-[2%] h-[69%] border px-[8%] py-[7%] ${motionClass}`}
                style={{
                    backgroundColor: palette.letter,
                    backgroundImage:
                        "url('/materials/cotton-paper-fibers-v2.webp'), repeating-linear-gradient(0deg, transparent 0 17%, color-mix(in srgb, var(--scrap-muted-ink) 9%, transparent) 17.2% 17.7%, transparent 18% 34%)",
                    backgroundSize: '360px 360px, 100% 100%',
                    borderColor: palette.edge,
                    boxShadow: `0 3px 3px rgba(58,36,24,0.14), 0 13px 20px rgba(58,36,24,0.12)`,
                    clipPath:
                        'polygon(1% 2%, 14% 0, 27% 1.4%, 40% 0, 53% 1.6%, 67% 0, 81% 1.5%, 99% 0.5%, 100% 25%, 99% 51%, 100% 76%, 98% 100%, 83% 98.7%, 68% 100%, 52% 98.5%, 36% 100%, 20% 98.6%, 1% 100%, 2% 73%, 0 48%, 2% 25%)',
                    transform: open
                        ? 'translateY(-35%) rotate(-1.2deg) rotateX(0deg)'
                        : reducedMotion
                          ? 'translateY(8%)'
                          : 'translateY(31%) rotate(-1.2deg) rotateX(7deg)',
                    opacity: open || context === 'editor' ? 1 : 0.64,
                }}
            >
                <p
                    className="line-clamp-2 font-semibold leading-tight"
                    style={{
                        color: theme.tokens.colors.accent,
                        fontFamily: 'var(--font-handwritten, cursive)',
                        fontSize: title.length > 42 ? '3.1cqw' : '3.65cqw',
                        fontWeight: 500,
                    }}
                >
                    {title}
                </p>
                <p
                    className="mt-[4%] whitespace-pre-wrap leading-snug"
                    style={{
                        color: theme.tokens.colors.ink,
                        fontFamily: 'var(--font-handwritten, cursive)',
                        fontSize: content.length > 360 ? '2.15cqw' : '2.55cqw',
                    }}
                >
                    {open || context === 'editor' ? content : content.slice(0, 80)}
                </p>
                <span
                    aria-hidden="true"
                    className="absolute -top-[4%] left-[38%] h-[10%] w-[28%] rotate-[-4deg]"
                    style={{
                        background: `color-mix(in srgb, ${theme.tokens.colors.tape} 68%, white)`,
                        clipPath:
                            'polygon(2% 8%, 14% 2%, 27% 7%, 39% 1%, 51% 6%, 65% 2%, 78% 8%, 98% 3%, 96% 93%, 82% 98%, 68% 94%, 53% 99%, 39% 94%, 24% 99%, 3% 93%)',
                        opacity: 0.78,
                    }}
                />
            </div>

            <div
                className="scrapbook-envelope__body absolute inset-x-0 bottom-0 h-[60%] overflow-hidden border"
                style={{
                    backgroundColor: palette.base,
                    borderColor: palette.edge,
                    backgroundImage:
                        "url('/materials/cotton-paper-fibers-v2.webp'), radial-gradient(circle at 24% 22%, rgba(255,255,255,0.2), transparent 24%), radial-gradient(circle at 72% 72%, color-mix(in srgb, var(--scrap-shadow) 42%, transparent), transparent 28%)",
                    backgroundBlendMode: 'multiply, normal, normal',
                    backgroundSize: '360px 360px, 100% 100%, 100% 100%',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -14px 22px rgba(58,36,24,0.10)',
                    clipPath:
                        'polygon(1% 3%, 15% 0, 30% 2%, 45% 0, 61% 2%, 77% 0, 99% 3%, 100% 94%, 83% 98%, 67% 96%, 50% 100%, 34% 97%, 17% 99%, 0 95%)',
                }}
            >
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-full"
                    style={{
                        clipPath: 'polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)',
                        backgroundColor: palette.pocket,
                        borderTop: `1px solid ${palette.edge}`,
                    }}
                />
                <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-[68%] origin-top ${motionClass}`}
                    style={{
                        clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                        backgroundColor: palette.flap,
                        borderBottom: `1px solid ${palette.edge}`,
                        transform: open && !reducedMotion ? 'rotateX(168deg)' : 'rotateX(0deg)',
                        transformStyle: 'preserve-3d',
                        boxShadow: open ? '0 -8px 16px rgba(58,36,24,0.12)' : '0 7px 12px rgba(58,36,24,0.10)',
                    }}
                />
                <span
                    aria-hidden="true"
                    className="scrapbook-envelope__seal absolute left-1/2 top-[52%] grid aspect-square w-[15%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
                    style={{
                        background: `radial-gradient(circle at 36% 30%, rgba(255,255,255,0.42), transparent 17%), ${theme.tokens.colors.accent}`,
                        boxShadow: `0 3px 8px ${theme.tokens.colors.shadow}, inset 0 0 0 3px color-mix(in srgb, ${theme.tokens.colors.accent} 70%, black)`,
                        color: palette.letter,
                    }}
                >
                    <span className="font-hand text-[4cqw] leading-none">♥</span>
                </span>
            </div>

            <span
                className="absolute -bottom-[7%] left-1/2 -translate-x-1/2 rotate-[-1deg] border px-[5%] py-[1.8%] text-center font-semibold whitespace-nowrap"
                style={{
                    backgroundImage: "url('/materials/cotton-paper-fibers-v2.webp')",
                    backgroundSize: '280px 280px',
                    backgroundColor: 'rgba(255,248,236,0.94)',
                    borderColor: palette.edge,
                    color: theme.tokens.colors.mutedInk,
                    fontSize: '2.1cqw',
                    opacity: interactive ? 1 : 0.75,
                    clipPath:
                        'polygon(2% 8%, 13% 2%, 25% 7%, 38% 1%, 52% 6%, 66% 2%, 80% 7%, 98% 3%, 97% 92%, 83% 98%, 69% 93%, 54% 99%, 39% 94%, 24% 99%, 3% 93%)',
                }}
            >
                {open ? 'fechar a cartinha' : 'abrir a cartinha'}
            </span>
        </div>
    );

    if (!interactive) {
        return (
            <div className="absolute" style={rootStyle}>
                {body}
            </div>
        );
    }

    return (
        <button
            aria-label={open ? `Fechar carta: ${title}` : `Abrir carta: ${title}`}
            className="absolute block touch-manipulation text-left"
            data-scrapbook-interactive="true"
            onClick={(event) => {
                stopCanvasInteraction(event);
                setOpen((current) => {
                    const nextOpen = !current;

                    trackEvent(nextOpen ? 'envelope_opened' : 'envelope_closed', {
                        elementId: String(element.id ?? ''),
                        elementType: 'interactive_envelope',
                    });

                    return nextOpen;
                });
            }}
            onPointerDown={stopCanvasInteraction}
            onTouchEnd={stopCanvasInteraction}
            onTouchStart={stopCanvasInteraction}
            style={rootStyle}
            type="button"
        >
            {body}
        </button>
    );
}

function FlipPolaroidElement({
    context,
    element,
    style,
    theme,
}: InteractiveElementProps & { context: RendererContext }) {
    const reducedMotion = usePrefersReducedMotion();
    const { trackEvent } = useAnalytics();
    const record = element as CanvasElement & Record<string, unknown>;
    const front = isRecord(record.front) ? record.front : {};
    const back = isRecord(record.back) ? record.back : {};
    const [flipped, setFlipped] = useState(false);
    const src =
        typeof front.src === 'string' && front.src.startsWith('/') && !front.src.startsWith('//') ? front.src : null;
    const placeholder = textValue(front.placeholderLabel, 'Sua foto aqui');
    const caption = textValue(front.caption, 'Nosso momento');
    const backText = textValue(back.text, 'Escreva uma mensagem para o verso.');
    const interactive = context !== 'editor';
    const rootStyle: CSSProperties = {
        ...style,
        color: theme.tokens.colors.ink,
        perspective: reducedMotion ? undefined : '1200px',
        pointerEvents: interactive ? 'auto' : 'none',
    };
    const flipStyle: CSSProperties = {
        transformStyle: reducedMotion ? undefined : 'preserve-3d',
        transform: flipped && !reducedMotion ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: reducedMotion ? 'none' : 'transform 360ms ease',
    };

    const body = (
        <div className="scrapbook-flip-polaroid relative h-full w-full" style={flipStyle}>
            <PolaroidFace flipped={false} theme={theme}>
                <div
                    className="relative h-[75%] overflow-hidden border"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 78%, white)`,
                        borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 42%, transparent)`,
                    }}
                >
                    {src ? (
                        <img
                            alt={caption}
                            className="h-full w-full object-cover"
                            decoding="async"
                            draggable={false}
                            loading="lazy"
                            src={src}
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center px-[8%] text-center font-semibold uppercase leading-tight"
                            style={{
                                backgroundImage:
                                    'linear-gradient(135deg, rgba(255,255,255,0.36), transparent 34%), radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--scrap-shadow) 35%, transparent), transparent 30%)',
                                color: theme.tokens.colors.mutedInk,
                                fontSize: placeholder.length > 24 ? '2.15cqw' : '2.65cqw',
                            }}
                        >
                            {placeholder}
                        </div>
                    )}
                </div>
                <p
                    className="flex h-[25%] items-center justify-center overflow-hidden text-center leading-tight"
                    style={{
                        color: theme.tokens.colors.ink,
                        fontFamily: 'var(--font-handwritten, cursive)',
                        fontSize: caption.length > 32 ? '2.45cqw' : '2.9cqw',
                    }}
                >
                    {caption}
                </p>
                <span
                    className="absolute -right-[2%] -top-[2%] rotate-[4deg] border px-[3%] py-[1.2%] font-semibold"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.82)',
                        borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 36%, transparent)`,
                        color: theme.tokens.colors.mutedInk,
                        fontSize: '1.8cqw',
                        opacity: interactive ? 1 : 0,
                    }}
                >
                    Toque para virar
                </span>
            </PolaroidFace>
            <PolaroidFace flipped theme={theme}>
                <div
                    className="grid h-full place-items-center rounded-[6px] border px-[9%] py-[10%] text-center"
                    style={{
                        backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 84%, white)`,
                        backgroundImage:
                            'repeating-linear-gradient(0deg, color-mix(in srgb, var(--scrap-muted-ink) 8%, transparent) 0 1px, transparent 1px 22px), radial-gradient(circle at 18% 20%, rgba(255,255,255,0.42), transparent 28%)',
                        borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 42%, transparent)`,
                        transform: reducedMotion ? undefined : 'rotateY(180deg)',
                    }}
                >
                    <p
                        className="whitespace-pre-wrap leading-snug"
                        style={{
                            color: theme.tokens.colors.ink,
                            fontFamily: 'var(--font-handwritten, cursive)',
                            fontSize: backText.length > 240 ? '2.2cqw' : '2.65cqw',
                        }}
                    >
                        {backText}
                    </p>
                </div>
            </PolaroidFace>
            {reducedMotion && flipped ? (
                <div className="absolute inset-0">
                    <PolaroidFace flipped={false} theme={theme}>
                        <div
                            className="grid h-full place-items-center rounded-[6px] border px-[9%] py-[10%] text-center"
                            style={{
                                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 84%, white)`,
                                borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 42%, transparent)`,
                            }}
                        >
                            <p className="whitespace-pre-wrap leading-snug" style={{ fontSize: '2.65cqw' }}>
                                {backText}
                            </p>
                        </div>
                    </PolaroidFace>
                </div>
            ) : null}
        </div>
    );

    if (!interactive) {
        return (
            <div className="absolute" style={rootStyle}>
                {body}
            </div>
        );
    }

    return (
        <button
            aria-label={flipped ? 'Virar polaroid para frente' : 'Virar polaroid para o verso'}
            className="absolute block touch-manipulation"
            data-scrapbook-interactive="true"
            onClick={(event) => {
                stopCanvasInteraction(event);
                setFlipped((current) => {
                    const nextFlipped = !current;

                    trackEvent('polaroid_flipped', {
                        elementId: String(element.id ?? ''),
                        elementType: 'flip_polaroid',
                        payload: {
                            side: nextFlipped ? 'back' : 'front',
                        },
                    });

                    return nextFlipped;
                });
            }}
            onPointerDown={stopCanvasInteraction}
            onTouchEnd={stopCanvasInteraction}
            onTouchStart={stopCanvasInteraction}
            style={rootStyle}
            type="button"
        >
            {body}
        </button>
    );
}

function PolaroidFace({
    children,
    flipped,
    theme,
}: {
    children: ReactNode;
    flipped: boolean;
    theme: NormalizedThemeConfig;
}) {
    return (
        <div
            className="absolute inset-0 overflow-hidden p-[5%] pb-[7%]"
            style={{
                backfaceVisibility: 'hidden',
                backgroundColor: '#FFFDF8',
                backgroundImage:
                    "url('/materials/cotton-paper-fibers-v2.webp'), linear-gradient(155deg, rgba(255,255,255,0.5), transparent 50%, rgba(58,36,24,0.06))",
                backgroundSize: '380px 380px, 100% 100%',
                border: `1px solid color-mix(in srgb, ${theme.tokens.colors.muted} 30%, transparent)`,
                boxShadow: `0 18px 30px ${theme.tokens.colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.72)`,
                clipPath:
                    'polygon(1% 1%, 24% 0, 49% 0.7%, 73% 0.1%, 99% 1%, 100% 31%, 99.5% 62%, 100% 99%, 75% 100%, 51% 99.4%, 26% 100%, 0.8% 99%, 0 68%, 0.5% 34%)',
                transform: flipped ? 'rotateY(180deg)' : undefined,
            }}
        >
            {children}
        </div>
    );
}

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return false;
        }

        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const query = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleChange = () => setReduced(query.matches);
        query.addEventListener?.('change', handleChange);

        return () => query.removeEventListener?.('change', handleChange);
    }, []);

    return reduced;
}

function textValue(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function envelopeVariant(value: unknown): EnvelopeVariant {
    if (value === 'kraft' || value === 'rose' || value === 'cream') {
        return value;
    }

    return 'kraft';
}

function envelopePalette(variant: EnvelopeVariant, theme: NormalizedThemeConfig) {
    if (variant === 'rose') {
        return {
            base: `color-mix(in srgb, ${theme.tokens.colors.accentSoft} 48%, #FFF8EC)`,
            flap: `color-mix(in srgb, ${theme.tokens.colors.accentSoft} 58%, #FFF8EC)`,
            pocket: `color-mix(in srgb, ${theme.tokens.colors.accentSoft} 38%, #FFF8EC)`,
            letter: '#FFFDF7',
            edge: `color-mix(in srgb, ${theme.tokens.colors.accent} 28%, transparent)`,
        };
    }

    if (variant === 'cream') {
        return {
            base: theme.tokens.colors.paperAlt,
            flap: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 86%, white)`,
            pocket: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 72%, ${theme.tokens.colors.muted})`,
            letter: '#FFFDF7',
            edge: `color-mix(in srgb, ${theme.tokens.colors.muted} 38%, transparent)`,
        };
    }

    return {
        base: '#C99F6B',
        flap: '#D8B783',
        pocket: '#B98252',
        letter: theme.tokens.colors.paper,
        edge: 'rgba(90,56,33,0.32)',
    };
}

function stopCanvasInteraction(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement> | TouchEvent<HTMLElement>) {
    event.stopPropagation();
}
