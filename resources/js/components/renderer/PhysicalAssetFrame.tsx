import type { CSSProperties, ReactNode } from 'react';

import type { RendererAsset } from './assetTypes';
import {
    resolveAssetFrameStyles,
    resolveAssetPhysicalConfig,
    resolveAssetRenderStyle,
    type AssetRenderStyle,
} from './assetStyleUtils';
import type { NormalizedThemeConfig, RendererContext } from './theme';

type PhysicalAssetFrameProps = {
    asset: RendererAsset;
    children: ReactNode;
    className?: string;
    context?: RendererContext;
    style?: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function PhysicalAssetFrame({
    asset,
    children,
    className,
    context = 'preview',
    style,
    theme,
}: PhysicalAssetFrameProps) {
    const renderStyle = resolveAssetRenderStyle(asset);
    const physical = resolveAssetPhysicalConfig(asset, renderStyle);
    const frameStyles = resolveAssetFrameStyles(asset, theme, renderStyle, physical);
    const shouldBlend = renderStyle === 'texture' || renderStyle === 'overlay';

    return (
        <span
            className={className}
            data-render-style={renderStyle}
            style={{
                ...frameStyles.outerStyle,
                mixBlendMode: shouldBlend ? blendModeFor(renderStyle) : undefined,
                pointerEvents: context === 'editor' ? 'auto' : 'none',
                ...style,
            }}
        >
            {frameStyles.backingStyle ? <AssetLayer style={frameStyles.backingStyle} /> : null}
            <span style={frameStyles.contentStyle}>{children}</span>
            {frameStyles.textureStyle ? <AssetLayer style={frameStyles.textureStyle} /> : null}
            {frameStyles.highlightStyle ? <AssetLayer style={frameStyles.highlightStyle} /> : null}
        </span>
    );
}

type AssetLayerProps = {
    style: CSSProperties;
};

function AssetLayer({ style }: AssetLayerProps) {
    return (
        <span
            aria-hidden="true"
            style={{
                inset: 0,
                pointerEvents: 'none',
                position: 'absolute',
                zIndex: 3,
                ...style,
            }}
        />
    );
}

function blendModeFor(renderStyle: AssetRenderStyle): CSSProperties['mixBlendMode'] {
    if (renderStyle === 'texture') {
        return 'multiply';
    }

    if (renderStyle === 'overlay') {
        return 'soft-light';
    }

    return undefined;
}
