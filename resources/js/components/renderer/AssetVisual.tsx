import type { CSSProperties, ReactNode } from 'react';

import type { RendererAsset } from './assetTypes';
import { objectFitForRenderStyle, resolveAssetRenderStyle } from './assetStyleUtils';
import { PhysicalAssetFrame } from './PhysicalAssetFrame';
import { isRecord, type NormalizedThemeConfig } from './theme';
import type { RendererContext } from './theme';

type AssetVisualProps = {
    asset: RendererAsset;
    className?: string;
    context?: RendererContext;
    overlay?: ReactNode;
    style?: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function AssetVisual({ asset, className, context = 'preview', overlay, style, theme }: AssetVisualProps) {
    const renderStyle = resolveAssetRenderStyle(asset);

    return (
        <PhysicalAssetFrame asset={asset} className={className} context={context} style={style} theme={theme}>
            <AssetVisualContent asset={asset} renderStyle={renderStyle} theme={theme} />
            {overlay}
        </PhysicalAssetFrame>
    );
}

type AssetVisualContentProps = {
    asset: RendererAsset;
    renderStyle: ReturnType<typeof resolveAssetRenderStyle>;
    theme: NormalizedThemeConfig;
};

function AssetVisualContent({ asset, renderStyle, theme }: AssetVisualContentProps) {
    if (asset.renderMode === 'image' && asset.previewUrl) {
        return (
            <img
                alt=""
                decoding="async"
                draggable={false}
                loading="lazy"
                src={asset.previewUrl}
                style={{
                    display: 'block',
                    height: '100%',
                    objectFit: objectFitForRenderStyle(renderStyle),
                    width: '100%',
                }}
            />
        );
    }

    return <ShapeAssetVisual asset={asset} theme={theme} />;
}

function ShapeAssetVisual({ asset, theme }: Pick<AssetVisualProps, 'asset' | 'theme'>) {
    const config = isRecord(asset.config) ? asset.config : {};
    const colors = isRecord(config.colors) ? config.colors : {};
    const primary = colorString(colors.primary, theme.tokens.colors.accent);
    const secondary = colorString(colors.secondary, theme.tokens.colors.accentSoft);
    const ink = colorString(colors.ink, theme.tokens.colors.ink);
    const shape = typeof config.shape === 'string' ? config.shape : 'label';

    return (
        <svg
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', height: '100%', overflow: 'visible', width: '100%' }}
            viewBox="0 0 100 100"
        >
            <Shape name={shape} primary={primary} secondary={secondary} ink={ink} />
        </svg>
    );
}

type ShapeProps = {
    ink: string;
    name: string;
    primary: string;
    secondary: string;
};

function Shape({ ink, name, primary, secondary }: ShapeProps) {
    if (name === 'heart') {
        return (
            <>
                <path
                    d="M50 89 C40 80 20 69 15 49 C11 32 20 19 34 18 C43 18 49 25 52 31 C57 22 64 17 74 19 C88 22 91 37 85 51 C78 68 61 81 50 89 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                />
                <path
                    d="M18 50 C21 66 39 78 50 86 C61 77 75 66 83 52"
                    fill="none"
                    opacity="0.3"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="4"
                />
                <path
                    d="M27 29 C34 24 41 27 45 34"
                    fill="none"
                    opacity="0.52"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="3"
                />
                <path
                    d="M18 46 L16 51 M86 42 L84 48 M49 86 L51 89"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="2.2"
                />
                <path
                    d="M23 61 L30 64 M65 72 L72 67 M37 78 L42 80"
                    opacity="0.28"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="1.4"
                />
            </>
        );
    }

    if (name === 'tape') {
        return (
            <>
                <path
                    d="M6 30 L12 27 L10 23 L19 25 L28 22 L38 24 L48 20 L58 23 L68 19 L78 21 L89 17 L95 21 L92 70 L96 74 L88 76 L82 80 L73 77 L64 81 L54 78 L45 82 L36 79 L26 83 L18 79 L9 82 Z"
                    fill={primary}
                    opacity="0.78"
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.3"
                />
                <path
                    d="M17 30 L14 76 M27 27 L24 78 M42 25 L39 76 M61 24 L60 75 M78 22 L81 73 M88 21 L91 69"
                    opacity="0.2"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="3"
                />
                <path
                    d="M9 34 L92 25 M10 44 L91 35 M10 57 L90 48 M9 69 L90 60"
                    opacity="0.09"
                    stroke={ink}
                    strokeWidth="1"
                />
            </>
        );
    }

    if (name === 'flower') {
        return (
            <>
                <path d="M52 91 C49 72 50 54 47 29" fill="none" stroke={ink} strokeLinecap="round" strokeWidth="2.2" />
                <path
                    d="M49 69 C38 61 30 58 21 60 C28 72 38 77 50 78 M50 55 C61 45 70 42 79 44 C74 57 65 62 50 65"
                    fill={secondary}
                    opacity="0.72"
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                />
                {[0, 72, 144, 216, 288].map((rotation) => (
                    <path
                        d="M50 48 C37 39 37 18 50 11 C63 19 63 40 50 48 Z"
                        fill={primary}
                        key={rotation}
                        stroke={ink}
                        strokeLinejoin="round"
                        strokeWidth="1.4"
                        transform={`rotate(${rotation} 50 50)`}
                    />
                ))}
                <circle cx="50" cy="50" fill={secondary} r="9" stroke={ink} strokeWidth="1.6" />
                <circle cx="47" cy="47" fill="#fff" opacity="0.36" r="2.5" />
            </>
        );
    }

    if (name === 'star') {
        return (
            <path
                d="M50 8 L60 37 L91 40 L67 58 L76 89 L49 72 L23 87 L32 58 L8 40 L39 36 Z"
                fill={primary}
                stroke={ink}
                strokeLinejoin="round"
                strokeWidth="2"
            />
        );
    }

    if (name === 'torn-paper') {
        return (
            <>
                <path
                    d="M7 17 L16 14 L24 17 L31 13 L40 16 L49 12 L59 16 L69 13 L78 17 L88 12 L94 18 L91 29 L94 40 L90 52 L93 64 L89 78 L81 83 L72 80 L62 85 L52 81 L42 85 L33 80 L23 84 L15 79 L9 82 L11 69 L7 58 L10 47 L6 35 L10 27 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                />
                <path
                    d="M23 39 H74 M20 54 H82 M30 68 H68"
                    opacity="0.23"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="2.5"
                />
                <path
                    d="M12 21 C29 18 42 20 57 17 C72 14 83 18 90 16"
                    fill="none"
                    opacity="0.42"
                    stroke="#fff"
                    strokeWidth="1.4"
                />
            </>
        );
    }

    if (name === 'stamp') {
        return (
            <>
                <path
                    d="M15 13 L22 16 L28 12 L35 16 L42 12 L49 16 L56 12 L63 16 L70 12 L77 16 L85 14 L83 22 L87 28 L83 35 L87 42 L83 49 L87 56 L83 63 L87 70 L82 77 L85 85 L77 83 L70 87 L63 83 L56 87 L49 83 L42 87 L35 83 L28 87 L21 83 L14 85 L17 77 L13 70 L17 63 L13 56 L17 49 L13 42 L17 35 L13 28 L17 21 Z"
                    fill={secondary}
                    stroke={primary}
                    strokeLinejoin="round"
                    strokeWidth="2.3"
                />
                <circle cx="50" cy="50" fill="none" opacity="0.8" r="24" stroke={ink} strokeWidth="2.2" />
                <path
                    d="M36 52 C43 41 58 41 65 52 M34 62 C44 59 57 65 67 61"
                    fill="none"
                    opacity="0.84"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="2.2"
                />
                <path d="M22 34 H42 M58 70 H79" opacity="0.44" stroke={primary} strokeWidth="1.5" />
            </>
        );
    }

    if (name === 'confetti') {
        return (
            <>
                <circle cx="18" cy="25" fill={primary} r="7" />
                <circle cx="80" cy="35" fill={secondary} r="6" />
                <circle cx="62" cy="75" fill={ink} r="5" opacity="0.8" />
                <path d="M34 18 L43 32 L28 35 Z" fill={secondary} stroke={ink} strokeLinejoin="round" strokeWidth="2" />
                <path
                    d="M20 73 C35 58 46 80 58 58 C64 48 73 53 80 45"
                    fill="none"
                    stroke={primary}
                    strokeLinecap="round"
                    strokeWidth="6"
                />
                <path
                    d="M58 18 L72 14 M78 66 L90 76 M10 48 L24 50"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="4"
                />
            </>
        );
    }

    if (name === 'scribble') {
        return (
            <>
                <path
                    d="M9 57 C20 28 31 72 43 48 C54 25 61 74 72 44 C78 27 84 35 91 29"
                    fill="none"
                    stroke={primary}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="5.5"
                />
                <path
                    d="M11 62 C23 32 34 76 45 52 C56 29 64 77 75 47"
                    fill="none"
                    opacity="0.38"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="1.6"
                />
            </>
        );
    }

    if (name === 'balloon') {
        return (
            <>
                <ellipse cx="50" cy="38" fill={primary} rx="26" ry="32" stroke={ink} strokeWidth="3" />
                <path d="M44 68 L56 68 L50 79 Z" fill={primary} stroke={ink} strokeLinejoin="round" strokeWidth="3" />
                <path
                    d="M50 79 C40 90 62 91 50 101"
                    fill="none"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="4"
                />
                <ellipse cx="41" cy="27" fill={secondary} opacity="0.5" rx="7" ry="11" />
            </>
        );
    }

    if (name === 'frame') {
        return (
            <>
                <path
                    d="M13 7 L84 5 L87 91 L16 95 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                />
                <path
                    d="M21 14 L78 12 L80 68 L23 71 Z"
                    fill={secondary}
                    opacity="0.26"
                    stroke={ink}
                    strokeWidth="1.2"
                />
                <path
                    d="M30 81 C42 78 58 85 72 80"
                    fill="none"
                    opacity="0.52"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="1.4"
                />
                <path d="M17 10 L84 8" opacity="0.75" stroke="#fff" strokeWidth="2.2" />
            </>
        );
    }

    if (name === 'envelope') {
        return (
            <>
                <path
                    d="M7 29 L13 25 L91 27 L94 33 L91 79 L84 83 L12 80 L7 74 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                />
                <path
                    d="M11 28 L50 59 L90 30"
                    fill="none"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                />
                <path
                    d="M9 76 L39 50 M91 77 L61 50"
                    fill="none"
                    opacity="0.46"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="3"
                />
                <circle cx="51" cy="59" fill={secondary} r="9" stroke={ink} strokeWidth="1.4" />
                <path
                    d="M47 58 C49 54 54 54 56 58 C57 62 53 65 51 67 C48 64 45 62 47 58 Z"
                    fill={primary}
                    opacity="0.88"
                />
            </>
        );
    }

    if (name === 'calendar') {
        return (
            <>
                <rect fill={primary} height="80" rx="8" stroke={ink} strokeWidth="2.5" width="76" x="12" y="12" />
                <path d="M12 30 H88" stroke={ink} strokeWidth="2.5" />
                <path d="M28 8 V22 M72 8 V22" stroke={ink} strokeLinecap="round" strokeWidth="5" />
                <path
                    d="M24 46 H76 M24 60 H76 M24 74 H62"
                    opacity="0.42"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="5"
                />
                <circle cx="72" cy="72" fill={secondary} r="9" stroke={ink} strokeWidth="2" />
            </>
        );
    }

    if (name === 'newspaper') {
        return (
            <>
                <path
                    d="M9 15 L25 12 L38 16 L52 13 L67 16 L82 12 L91 18 L87 85 L70 82 L56 86 L40 82 L24 86 L11 81 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <path
                    d="M21 28 H78 M21 39 H54 M21 53 H80 M20 65 H72 M22 76 H58"
                    opacity="0.52"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="3"
                />
                <rect fill={secondary} height="22" opacity="0.45" rx="3" width="23" x="57" y="34" />
            </>
        );
    }

    if (name === 'pressed-sprig') {
        return (
            <>
                <path
                    d="M48 94 C51 75 48 56 54 37 C59 23 68 15 79 8"
                    fill="none"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="2.1"
                />
                <path
                    d="M52 69 C42 58 34 54 24 56 C29 68 38 73 50 77 M53 55 C66 48 75 46 84 50 C77 61 68 65 52 64 M57 39 C48 31 42 25 35 27 C38 38 45 44 54 48 M62 28 C72 24 79 20 85 14"
                    fill={secondary}
                    opacity="0.78"
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.25"
                />
                {[
                    ['79', '9'],
                    ['84', '15'],
                    ['75', '18'],
                    ['67', '23'],
                    ['36', '26'],
                ].map(([cx, cy]) => (
                    <circle
                        cx={cx}
                        cy={cy}
                        fill={primary}
                        key={`${cx}-${cy}`}
                        opacity="0.9"
                        r="4.6"
                        stroke={ink}
                        strokeWidth="1"
                    />
                ))}
                <path d="M38 85 L59 82" opacity="0.38" stroke={primary} strokeLinecap="round" strokeWidth="9" />
            </>
        );
    }

    if (name === 'lipstick-kiss') {
        return (
            <>
                <path
                    d="M8 49 C23 27 35 24 49 35 C62 22 79 29 92 49 C79 66 63 75 49 73 C34 75 20 66 8 49 Z"
                    fill={primary}
                    opacity="0.9"
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                />
                <path
                    d="M12 49 C29 52 40 48 49 41 C59 49 72 53 88 49 C75 55 62 58 49 56 C36 59 23 56 12 49 Z"
                    fill={secondary}
                    opacity="0.62"
                />
                <path
                    d="M21 42 C28 35 35 33 42 38 M61 37 C69 33 76 36 82 42 M25 61 C36 68 65 69 76 60"
                    fill="none"
                    opacity="0.38"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="2.2"
                />
            </>
        );
    }

    if (name === 'film-strip') {
        return (
            <>
                <path
                    d="M7 10 L91 7 L94 91 L10 94 Z"
                    fill={ink}
                    stroke={primary}
                    strokeLinejoin="round"
                    strokeWidth="1.4"
                />
                {[18, 38, 58, 78].map((y) => (
                    <g key={y}>
                        <rect fill={secondary} height="6" rx="1" width="7" x="10" y={y - 3} />
                        <rect fill={secondary} height="6" rx="1" width="7" x="83" y={y - 3} />
                    </g>
                ))}
                {[14, 41, 68].map((y) => (
                    <rect
                        fill={secondary}
                        height="22"
                        key={y}
                        opacity="0.34"
                        stroke={primary}
                        strokeWidth="1"
                        width="56"
                        x="22"
                        y={y}
                    />
                ))}
            </>
        );
    }

    if (name === 'paper-clip') {
        return (
            <>
                <path
                    d="M64 11 C78 16 78 31 72 46 L57 80 C53 90 42 94 33 88 C24 82 23 70 28 59 L44 23 C47 17 54 14 60 17 C67 20 69 28 66 35 L49 72 C47 76 42 78 38 75 C34 72 34 68 36 63 L50 32"
                    fill="none"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="7"
                />
                <path
                    d="M63 12 C72 17 72 28 68 39"
                    fill="none"
                    opacity="0.7"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="2.5"
                />
            </>
        );
    }

    if (name === 'memory-ticket') {
        return (
            <>
                <path
                    d="M8 23 L92 20 L91 38 C82 41 82 56 92 59 L91 78 L8 81 L9 63 C19 59 19 44 8 40 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                />
                <path d="M64 22 L65 78" opacity="0.48" stroke={ink} strokeDasharray="3 3" strokeWidth="1.2" />
                <path
                    d="M17 34 H55 M17 45 H48 M17 57 H55 M17 68 H42"
                    opacity="0.52"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="2.1"
                />
                <path d="M73 32 V67 M80 31 V67" opacity="0.54" stroke={secondary} strokeWidth="4" />
            </>
        );
    }

    if (name === 'torn-heart') {
        return (
            <>
                <path
                    d="M50 89 C42 81 19 69 15 48 C12 32 22 20 35 20 C43 20 49 26 52 32 C57 22 65 18 75 21 C89 25 91 40 84 54 C75 70 61 82 50 89 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                />
                <path
                    d="M53 30 L47 42 L54 50 L46 60 L53 68 L48 85"
                    fill={secondary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                />
                <path
                    d="M24 48 C30 55 34 64 42 70"
                    fill="none"
                    opacity="0.44"
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                />
            </>
        );
    }

    return (
        <>
            <path
                d="M12 27 L35 24 L48 27 L64 23 L88 27 L82 72 L68 77 L52 74 L36 78 L19 74 Z"
                fill={primary}
                stroke={ink}
                strokeLinejoin="round"
                strokeWidth="1.7"
            />
            <circle cx="24" cy="50" fill={secondary} r="5" stroke={ink} strokeWidth="2" />
            <path d="M33 49 H75 M34 57 H65" opacity="0.55" stroke={secondary} strokeLinecap="round" strokeWidth="3" />
        </>
    );
}

function colorString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value !== '' ? value : fallback;
}
