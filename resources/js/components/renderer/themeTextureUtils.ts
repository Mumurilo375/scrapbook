import type { CSSProperties } from 'react';

import { assetFromMap, type RendererAsset, type RendererAssetMap } from './assetTypes';
import type { NormalizedThemeConfig, ThemeTextureLayerConfig } from './theme';

export type ThemeTextureSlot = keyof NormalizedThemeConfig['textures'];

export type ResolvedThemeTextureLayer = ThemeTextureLayerConfig & {
    asset: RendererAsset;
    previewUrl: string;
};

export function getThemeAssetByRole(
    assetMap: RendererAssetMap | undefined,
    role: string | null | undefined,
): RendererAsset | null {
    if (!assetMap || !role) {
        return null;
    }

    return (
        Object.values(assetMap).find(
            (asset) => asset.source === 'theme' && asset.role === role && isSafeResolvedAssetUrl(asset.previewUrl),
        ) ??
        Object.values(assetMap).find((asset) => asset.role === role && isSafeResolvedAssetUrl(asset.previewUrl)) ??
        null
    );
}

export function resolveThemeTextureLayer(
    theme: NormalizedThemeConfig,
    assetMap: RendererAssetMap | undefined,
    slot: ThemeTextureSlot,
): ResolvedThemeTextureLayer | null {
    const layer = theme.textures[slot];

    if (!layer) {
        return null;
    }

    const asset = assetFromMap(assetMap, layer.assetId) ?? getThemeAssetByRole(assetMap, layer.assetRole);
    const previewUrl = asset?.previewUrl;

    if (!asset || !isSafeResolvedAssetUrl(previewUrl)) {
        return null;
    }

    return {
        ...layer,
        asset,
        previewUrl,
    };
}

export function buildTextureLayerStyle(
    theme: NormalizedThemeConfig,
    assetMap: RendererAssetMap | undefined,
    slot: ThemeTextureSlot,
): CSSProperties | null {
    const layer = resolveThemeTextureLayer(theme, assetMap, slot);

    if (!layer) {
        return null;
    }

    return {
        backgroundImage: cssUrl(layer.previewUrl),
        backgroundPosition: layer.position,
        backgroundRepeat: layer.repeat,
        backgroundSize: layer.size,
        mixBlendMode: layer.blendMode as CSSProperties['mixBlendMode'],
        opacity: layer.opacity,
    };
}

export function firstTextureLayerStyle(
    theme: NormalizedThemeConfig,
    assetMap: RendererAssetMap | undefined,
    slots: ThemeTextureSlot[],
): CSSProperties | null {
    for (const slot of slots) {
        const style = buildTextureLayerStyle(theme, assetMap, slot);

        if (style) {
            return style;
        }
    }

    return null;
}

function isSafeResolvedAssetUrl(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !/[\n\r"\\]/.test(value);
}

function cssUrl(value: string): string {
    return `url("${value.replace(/"/g, '%22')}")`;
}
