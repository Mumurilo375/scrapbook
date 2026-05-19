import type { CSSProperties } from 'react';

import type { RendererAsset } from './assetTypes';
import { isRecord, type NormalizedThemeConfig } from './theme';

export type AssetRenderStyle =
    | 'background'
    | 'border'
    | 'cutout'
    | 'decoration'
    | 'flat'
    | 'flower'
    | 'frame'
    | 'label'
    | 'overlay'
    | 'paper'
    | 'stamp'
    | 'sticker'
    | 'tape'
    | 'texture';

export type AssetPhysicalConfig = {
    borderWidth: number;
    dropShadow: boolean;
    edgeHighlight: boolean;
    lift: number;
    opacity: number;
    paperTexture: boolean;
    shadowIntensity: 'none' | 'soft' | 'medium' | 'strong';
    slightRotation: boolean;
    whiteBorder: boolean;
};

export type AssetDefaultTransform = {
    h: number;
    rotation: number;
    w: number;
};

export type AssetFrameStyles = {
    backingStyle?: CSSProperties;
    contentStyle: CSSProperties;
    highlightStyle?: CSSProperties;
    outerStyle: CSSProperties;
    textureStyle?: CSSProperties;
};

type DefaultTransformOptions = {
    artboardHeight?: number;
    artboardWidth?: number;
};

const RENDER_STYLES = new Set<AssetRenderStyle>([
    'background',
    'border',
    'cutout',
    'decoration',
    'flat',
    'flower',
    'frame',
    'label',
    'overlay',
    'paper',
    'stamp',
    'sticker',
    'tape',
    'texture',
]);

export function resolveAssetRenderStyle(asset: RendererAsset): AssetRenderStyle {
    const configuredStyle = stringValue(asset.renderStyle) ?? stringValue(asset.config?.renderStyle);

    if (configuredStyle && isAssetRenderStyle(configuredStyle)) {
        return configuredStyle;
    }

    return renderStyleForType(asset.type);
}

export function resolveAssetPhysicalConfig(asset: RendererAsset, renderStyle = resolveAssetRenderStyle(asset)): AssetPhysicalConfig {
    const rawPhysical = isRecord(asset.physical) ? asset.physical : isRecord(asset.config?.physical) ? asset.config.physical : {};
    const defaults = physicalDefaults(renderStyle);

    return {
        borderWidth: clampNumber(rawPhysical.borderWidth, defaults.borderWidth, 0, 32),
        dropShadow: booleanValue(rawPhysical.dropShadow, defaults.dropShadow),
        edgeHighlight: booleanValue(rawPhysical.edgeHighlight, defaults.edgeHighlight),
        lift: clampNumber(rawPhysical.lift, defaults.lift, 0, 24),
        opacity: clampNumber(rawPhysical.opacity, defaults.opacity, 0.1, 1),
        paperTexture: booleanValue(rawPhysical.paperTexture, defaults.paperTexture),
        shadowIntensity: shadowIntensityValue(rawPhysical.shadowIntensity, defaults.shadowIntensity),
        slightRotation: booleanValue(rawPhysical.slightRotation, defaults.slightRotation),
        whiteBorder: booleanValue(rawPhysical.whiteBorder, defaults.whiteBorder),
    };
}

export function resolveAssetDefaultTransform(asset: RendererAsset, options: DefaultTransformOptions = {}): AssetDefaultTransform {
    const renderStyle = resolveAssetRenderStyle(asset);
    const defaultTransform = isRecord(asset.defaultTransform)
        ? asset.defaultTransform
        : isRecord(asset.config?.defaultTransform)
          ? asset.config.defaultTransform
          : {};
    const defaultSize = isRecord(asset.config?.defaultSize) ? asset.config.defaultSize : {};
    const fallback = defaultSizeForRenderStyle(renderStyle, options);
    const width = positiveNumber(defaultTransform.w) ?? positiveNumber(defaultSize.w) ?? fallback.w;
    const height = positiveNumber(defaultTransform.h) ?? positiveNumber(defaultSize.h) ?? fallback.h;
    const rotation = numberValue(defaultTransform.rotation, fallback.rotation);

    return {
        h: Math.round(height),
        rotation: Math.round(rotation),
        w: Math.round(width),
    };
}

export function objectFitForRenderStyle(renderStyle: AssetRenderStyle): CSSProperties['objectFit'] {
    if (renderStyle === 'background' || renderStyle === 'texture' || renderStyle === 'overlay') {
        return 'cover';
    }

    return 'contain';
}

export function resolveAssetFrameStyles(
    asset: RendererAsset,
    theme: NormalizedThemeConfig,
    renderStyle = resolveAssetRenderStyle(asset),
    physical = resolveAssetPhysicalConfig(asset, renderStyle),
): AssetFrameStyles {
    const shadowFilter = assetShadowFilter(physical, theme);
    const outlineFilter = physical.whiteBorder ? whiteOutlineFilter(physical.borderWidth) : '';
    const contentFilter = [outlineFilter, shadowFilter].filter(Boolean).join(' ');
    const needsBacking = backingStyles.has(renderStyle);

    return {
        backingStyle: needsBacking ? backingStyleFor(renderStyle, theme, physical) : undefined,
        contentStyle: {
            borderRadius: contentRadiusFor(renderStyle),
            display: 'block',
            filter: contentFilter || undefined,
            height: '100%',
            opacity: physical.opacity,
            overflow: renderStyle === 'paper' || renderStyle === 'label' || renderStyle === 'tape' ? 'hidden' : 'visible',
            position: 'relative',
            width: '100%',
            zIndex: 2,
        },
        highlightStyle: physical.edgeHighlight ? highlightStyleFor(renderStyle) : undefined,
        outerStyle: {
            display: 'block',
            height: '100%',
            position: 'relative',
            transform: innerTransformFor(renderStyle, physical),
            transformOrigin: 'center',
            transformStyle: 'preserve-3d',
            transition: 'transform 160ms ease, filter 160ms ease',
            width: '100%',
        },
        textureStyle: physical.paperTexture ? textureStyleFor(renderStyle, theme) : undefined,
    };
}

function renderStyleForType(type: string): AssetRenderStyle {
    const normalized = type.trim().toLowerCase();

    if (normalized === 'background') {
        return 'background';
    }

    if (normalized === 'border') {
        return 'border';
    }

    if (normalized === 'cutout' || normalized === 'newspaper') {
        return 'cutout';
    }

    if (normalized === 'paper' || normalized === 'envelope') {
        return 'paper';
    }

    if (normalized === 'tape') {
        return 'tape';
    }

    if (normalized === 'frame') {
        return 'frame';
    }

    if (normalized === 'label') {
        return 'label';
    }

    if (normalized === 'stamp') {
        return 'stamp';
    }

    if (normalized === 'flower') {
        return 'flower';
    }

    if (normalized === 'texture' || normalized === 'overlay') {
        return normalized;
    }

    if (normalized === 'decoration' || normalized === 'doodle' || normalized === 'icon' || normalized === 'shape') {
        return 'decoration';
    }

    if (normalized === 'flat' || normalized === 'other') {
        return 'flat';
    }

    return 'sticker';
}

function physicalDefaults(renderStyle: AssetRenderStyle): AssetPhysicalConfig {
    if (renderStyle === 'texture' || renderStyle === 'background') {
        return {
            borderWidth: 0,
            dropShadow: false,
            edgeHighlight: false,
            lift: 0,
            opacity: renderStyle === 'texture' ? 0.52 : 1,
            paperTexture: false,
            shadowIntensity: 'none',
            slightRotation: false,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'overlay' || renderStyle === 'flat') {
        return {
            borderWidth: 0,
            dropShadow: false,
            edgeHighlight: false,
            lift: 0,
            opacity: renderStyle === 'overlay' ? 0.72 : 1,
            paperTexture: false,
            shadowIntensity: 'none',
            slightRotation: false,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'tape') {
        return {
            borderWidth: 0,
            dropShadow: true,
            edgeHighlight: true,
            lift: 3,
            opacity: 0.84,
            paperTexture: true,
            shadowIntensity: 'soft',
            slightRotation: true,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'paper' || renderStyle === 'label') {
        return {
            borderWidth: renderStyle === 'label' ? 2 : 0,
            dropShadow: true,
            edgeHighlight: true,
            lift: renderStyle === 'label' ? 5 : 6,
            opacity: 1,
            paperTexture: true,
            shadowIntensity: 'medium',
            slightRotation: true,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'stamp') {
        return {
            borderWidth: 0,
            dropShadow: true,
            edgeHighlight: false,
            lift: 2,
            opacity: 0.9,
            paperTexture: true,
            shadowIntensity: 'soft',
            slightRotation: true,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'flower' || renderStyle === 'decoration' || renderStyle === 'cutout') {
        return {
            borderWidth: 0,
            dropShadow: true,
            edgeHighlight: renderStyle === 'cutout',
            lift: renderStyle === 'cutout' ? 6 : 7,
            opacity: 1,
            paperTexture: renderStyle === 'cutout',
            shadowIntensity: 'medium',
            slightRotation: true,
            whiteBorder: false,
        };
    }

    if (renderStyle === 'frame' || renderStyle === 'border') {
        return {
            borderWidth: 0,
            dropShadow: true,
            edgeHighlight: true,
            lift: 7,
            opacity: 1,
            paperTexture: false,
            shadowIntensity: 'medium',
            slightRotation: false,
            whiteBorder: false,
        };
    }

    return {
        borderWidth: 8,
        dropShadow: true,
        edgeHighlight: true,
        lift: 8,
        opacity: 1,
        paperTexture: true,
        shadowIntensity: 'medium',
        slightRotation: true,
        whiteBorder: true,
    };
}

function defaultSizeForRenderStyle(renderStyle: AssetRenderStyle, options: DefaultTransformOptions): AssetDefaultTransform {
    if ((renderStyle === 'background' || renderStyle === 'texture') && options.artboardWidth && options.artboardHeight) {
        return { h: options.artboardHeight, rotation: 0, w: options.artboardWidth };
    }

    if (renderStyle === 'overlay' && options.artboardWidth && options.artboardHeight) {
        return { h: options.artboardHeight, rotation: 0, w: options.artboardWidth };
    }

    if (renderStyle === 'tape') {
        return { h: 80, rotation: -3, w: 260 };
    }

    if (renderStyle === 'frame') {
        return { h: 240, rotation: -2, w: 320 };
    }

    if (renderStyle === 'paper') {
        return { h: 260, rotation: -3, w: 360 };
    }

    if (renderStyle === 'label') {
        return { h: 120, rotation: -3, w: 240 };
    }

    if (renderStyle === 'stamp') {
        return { h: 140, rotation: -5, w: 140 };
    }

    if (renderStyle === 'flower' || renderStyle === 'decoration' || renderStyle === 'cutout') {
        return { h: 180, rotation: -4, w: 180 };
    }

    return { h: 180, rotation: -4, w: 180 };
}

function whiteOutlineFilter(borderWidth: number): string {
    const color = 'rgba(255,255,255,0.98)';
    const offset = Math.max(1, Math.min(6, Math.round(borderWidth / 2)));

    return [
        `drop-shadow(${offset}px 0 0 ${color})`,
        `drop-shadow(-${offset}px 0 0 ${color})`,
        `drop-shadow(0 ${offset}px 0 ${color})`,
        `drop-shadow(0 -${offset}px 0 ${color})`,
        `drop-shadow(${offset}px ${offset}px 0 ${color})`,
        `drop-shadow(-${offset}px ${offset}px 0 ${color})`,
        `drop-shadow(${offset}px -${offset}px 0 ${color})`,
        `drop-shadow(-${offset}px -${offset}px 0 ${color})`,
    ].join(' ');
}

function assetShadowFilter(physical: AssetPhysicalConfig, theme: NormalizedThemeConfig): string {
    if (!physical.dropShadow || physical.shadowIntensity === 'none') {
        return '';
    }

    const shadow = theme.tokens.colors.shadow;
    const lift = Math.max(1, physical.lift);

    if (physical.shadowIntensity === 'strong') {
        return `drop-shadow(0 ${Math.round(lift * 0.55)}px ${Math.round(lift * 0.6)}px rgba(58,36,24,0.24)) drop-shadow(0 ${lift + 8}px ${lift * 2.6}px ${shadow})`;
    }

    if (physical.shadowIntensity === 'soft') {
        return `drop-shadow(0 ${Math.round(lift * 0.45)}px ${Math.round(lift * 0.65)}px rgba(58,36,24,0.14)) drop-shadow(0 ${lift + 2}px ${Math.max(8, lift * 1.8)}px ${shadow})`;
    }

    return `drop-shadow(0 ${Math.round(lift * 0.5)}px ${Math.round(lift * 0.7)}px rgba(58,36,24,0.18)) drop-shadow(0 ${lift + 5}px ${Math.max(12, lift * 2.2)}px ${shadow})`;
}

const backingStyles = new Set<AssetRenderStyle>(['label', 'paper', 'stamp', 'tape']);

function backingStyleFor(renderStyle: AssetRenderStyle, theme: NormalizedThemeConfig, physical: AssetPhysicalConfig): CSSProperties {
    if (renderStyle === 'tape') {
        return {
            background: `linear-gradient(90deg, transparent 0 5%, color-mix(in srgb, ${theme.tokens.colors.tape} 66%, white) 5% 95%, transparent 95%), linear-gradient(135deg, rgba(255,255,255,0.42), transparent 42%, rgba(58,36,24,0.08))`,
            borderRadius: '5px 9px 6px 8px',
            boxShadow: `0 3px 8px rgba(58,36,24,0.14), inset 0 0 0 1px rgba(255,255,255,0.32)`,
            opacity: physical.opacity,
            zIndex: 1,
        };
    }

    if (renderStyle === 'stamp') {
        return {
            background: `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 78%, white)`,
            border: `1px dashed color-mix(in srgb, ${theme.tokens.colors.accent} 44%, transparent)`,
            borderRadius: '12px',
            boxShadow: `0 2px 7px rgba(58,36,24,0.12)`,
            opacity: 0.7,
            zIndex: 1,
        };
    }

    return {
        background: `linear-gradient(135deg, rgba(255,255,255,0.52), transparent 34%), color-mix(in srgb, ${theme.tokens.colors.paperAlt} 78%, white)`,
        border: renderStyle === 'label' ? `1px solid color-mix(in srgb, ${theme.tokens.colors.muted} 46%, transparent)` : undefined,
        borderRadius: renderStyle === 'paper' ? '18px 12px 22px 14px' : '12px',
        boxShadow: `0 ${Math.max(4, physical.lift)}px ${Math.max(12, physical.lift * 2)}px ${theme.tokens.colors.shadow}, inset 0 0 0 1px rgba(255,255,255,0.44)`,
        opacity: 0.92,
        zIndex: 1,
    };
}

function highlightStyleFor(renderStyle: AssetRenderStyle): CSSProperties {
    const radius = contentRadiusFor(renderStyle);

    return {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.46), transparent 30%, transparent 70%, rgba(58,36,24,0.10))',
        borderRadius: radius,
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.28)',
        mixBlendMode: 'screen',
        opacity: renderStyle === 'tape' ? 0.42 : 0.58,
        zIndex: 5,
    };
}

function textureStyleFor(renderStyle: AssetRenderStyle, theme: NormalizedThemeConfig): CSSProperties {
    return {
        backgroundImage: `radial-gradient(circle at 24% 28%, rgba(255,255,255,0.46) 0 1px, transparent 1.5px), radial-gradient(circle at 74% 68%, color-mix(in srgb, ${theme.tokens.colors.muted} 22%, transparent) 0 1px, transparent 1.6px), linear-gradient(90deg, rgba(58,36,24,0.035) 1px, transparent 1px)`,
        backgroundSize: renderStyle === 'tape' ? '14px 14px, 19px 19px, 22px 22px' : '18px 18px, 26px 26px, 32px 32px',
        borderRadius: contentRadiusFor(renderStyle),
        mixBlendMode: 'multiply',
        opacity: renderStyle === 'stamp' ? 0.22 : 0.3,
        zIndex: 4,
    };
}

function innerTransformFor(renderStyle: AssetRenderStyle, physical: AssetPhysicalConfig): string {
    const lift = physical.lift > 0 ? `translate3d(0, -${Math.min(4, Math.round(physical.lift / 3))}px, 0)` : '';
    const tilt = physical.slightRotation && renderStyle !== 'texture' && renderStyle !== 'background' ? 'rotate(-0.7deg)' : '';

    return [lift, tilt].filter(Boolean).join(' ') || 'none';
}

function contentRadiusFor(renderStyle: AssetRenderStyle): string {
    if (renderStyle === 'tape') {
        return '5px 9px 6px 8px';
    }

    if (renderStyle === 'paper') {
        return '18px 12px 22px 14px';
    }

    if (renderStyle === 'label' || renderStyle === 'stamp') {
        return '12px';
    }

    if (renderStyle === 'frame' || renderStyle === 'border') {
        return '8px';
    }

    return '10px';
}

function isAssetRenderStyle(value: string): value is AssetRenderStyle {
    return RENDER_STYLES.has(value as AssetRenderStyle);
}

function stringValue(value: unknown): string | null {
    return typeof value === 'string' && value.trim() !== '' ? value.trim().toLowerCase() : null;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
    return typeof value === 'boolean' ? value : fallback;
}

function positiveNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function numberValue(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
    const number = numberValue(value, fallback);

    return Math.min(Math.max(number, min), max);
}

function shadowIntensityValue(value: unknown, fallback: AssetPhysicalConfig['shadowIntensity']): AssetPhysicalConfig['shadowIntensity'] {
    if (value === 'none' || value === 'soft' || value === 'medium' || value === 'strong') {
        return value;
    }

    return fallback;
}
