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
                draggable={false}
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
                    d="M50 86 C22 66 13 48 18 31 C22 17 39 14 50 28 C61 14 78 17 82 31 C87 48 78 66 50 86 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="3"
                />
                <path
                    d="M28 37 C31 28 39 27 45 34"
                    fill="none"
                    opacity="0.45"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="5"
                />
            </>
        );
    }

    if (name === 'tape') {
        return (
            <>
                <path
                    d="M8 28 L92 19 L96 72 L12 81 Z"
                    fill={primary}
                    opacity="0.86"
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <path
                    d="M18 31 L14 78 M32 27 L28 76 M84 21 L88 70"
                    opacity="0.28"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="5"
                />
            </>
        );
    }

    if (name === 'flower') {
        return (
            <>
                {[0, 60, 120, 180, 240, 300].map((rotation) => (
                    <ellipse
                        cx="50"
                        cy="28"
                        fill={primary}
                        key={rotation}
                        rx="14"
                        ry="22"
                        stroke={ink}
                        strokeWidth="2"
                        transform={`rotate(${rotation} 50 50)`}
                    />
                ))}
                <circle cx="50" cy="50" fill={secondary} r="15" stroke={ink} strokeWidth="2" />
            </>
        );
    }

    if (name === 'star') {
        return (
            <path
                d="M50 9 L61 37 L91 39 L68 58 L76 88 L50 71 L24 88 L32 58 L9 39 L39 37 Z"
                fill={primary}
                stroke={ink}
                strokeLinejoin="round"
                strokeWidth="3"
            />
        );
    }

    if (name === 'torn-paper') {
        return (
            <>
                <path
                    d="M8 18 L22 14 L35 18 L48 14 L62 18 L77 13 L92 19 L88 80 L73 84 L61 79 L45 84 L31 80 L16 84 L10 78 Z"
                    fill={primary}
                    stroke={ink}
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <path
                    d="M23 39 H74 M20 54 H82 M30 68 H68"
                    opacity="0.35"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="4"
                />
            </>
        );
    }

    if (name === 'stamp') {
        return (
            <>
                <rect
                    fill={secondary}
                    height="72"
                    rx="9"
                    stroke={primary}
                    strokeDasharray="6 4"
                    strokeWidth="6"
                    width="72"
                    x="14"
                    y="14"
                />
                <circle cx="50" cy="50" fill="none" r="23" stroke={ink} strokeWidth="3" />
                <path
                    d="M36 52 C43 42 58 42 65 52 M35 62 H66"
                    fill="none"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeWidth="3"
                />
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
            <path
                d="M10 58 C23 24 39 83 52 45 C64 10 71 82 90 35"
                fill="none"
                stroke={primary}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="10"
            />
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
                <rect fill={primary} height="88" rx="6" stroke={ink} strokeWidth="2" width="74" x="13" y="6" />
                <rect fill="none" height="54" stroke={secondary} strokeWidth="7" width="54" x="23" y="16" />
                <rect fill={secondary} height="9" opacity="0.65" rx="4" width="42" x="29" y="78" />
            </>
        );
    }

    if (name === 'envelope') {
        return (
            <>
                <path d="M8 27 H92 V78 H8 Z" fill={primary} stroke={ink} strokeLinejoin="round" strokeWidth="2.5" />
                <path
                    d="M9 28 L50 58 L91 28"
                    fill="none"
                    stroke={ink}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                />
                <path
                    d="M8 78 L39 50 M92 78 L61 50"
                    fill="none"
                    opacity="0.55"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="5"
                />
                <path
                    d="M22 37 H43 M22 46 H36"
                    opacity="0.42"
                    stroke={secondary}
                    strokeLinecap="round"
                    strokeWidth="4"
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

    return (
        <>
            <path d="M13 26 H87 L80 74 H20 Z" fill={primary} stroke={ink} strokeLinejoin="round" strokeWidth="2.5" />
            <circle cx="24" cy="50" fill={secondary} r="5" stroke={ink} strokeWidth="2" />
            <path d="M32 50 H76" stroke={secondary} strokeLinecap="round" strokeWidth="5" />
        </>
    );
}

function colorString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value !== '' ? value : fallback;
}
