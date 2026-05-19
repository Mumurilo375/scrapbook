import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import { assetFromMap, type RendererAssetMap } from './assetTypes';
import { AssetVisual } from './AssetVisual';
import { isRecord, resolveThemeColor, type NormalizedThemeConfig, type RendererContext } from './theme';

type StickerElementProps = {
    artboard: {
        width: number;
        height: number;
    };
    element: CanvasElement;
    style: CSSProperties;
    assets?: RendererAssetMap;
    context?: RendererContext;
    theme: NormalizedThemeConfig;
};

export function StickerElement({ artboard, assets, context = 'preview', element, style, theme }: StickerElementProps) {
    const text =
        typeof element.text === 'string'
            ? element.text
            : typeof element.content === 'string'
              ? element.content
              : typeof element.label === 'string'
                ? element.label
                : '';
    const elementStyle = isRecord(element.style) ? element.style : {};
    const asset = assetFromMap(assets, (element as Record<string, unknown>).assetId ?? (element as Record<string, unknown>).asset_id);
    const fontSize =
        typeof elementStyle.fontSize === 'number' && Number.isFinite(elementStyle.fontSize)
            ? `${(elementStyle.fontSize / artboard.width) * 100}cqw`
            : '3cqw';
    const color = resolveThemeColor(theme, elementStyle.color, theme.tokens.colors.accent);
    const textAlign = safeTextAlign(elementStyle.align) ?? 'center';

    if (asset) {
        const overlay =
            text !== '' ? (
                <span
                    className="pointer-events-none absolute inset-[12%] z-[6] flex items-center justify-center whitespace-pre-wrap break-words px-2 font-semibold"
                    style={{ color, fontSize, textAlign }}
                >
                    {text}
                </span>
            ) : null;

        return (
            <div className="absolute flex items-center justify-center overflow-visible" style={style}>
                <AssetVisual asset={asset} context={context} overlay={overlay} theme={theme} />
            </div>
        );
    }

    return (
        <div
            className="absolute flex items-center justify-center rounded-full px-2 font-semibold whitespace-pre-wrap break-words"
            style={{
                ...style,
                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.accentSoft} 42%, ${theme.tokens.colors.paper})`,
                border: `1px solid color-mix(in srgb, ${theme.tokens.colors.accent} 28%, transparent)`,
                boxShadow: theme.elements.sticker.shadow ? `0 9px 18px ${theme.tokens.colors.shadow}` : undefined,
                color,
                fontSize,
                textAlign,
            }}
        >
            {text}
        </div>
    );
}

function safeTextAlign(align: unknown): 'left' | 'center' | 'right' | undefined {
    if (align === 'left' || align === 'center' || align === 'right') {
        return align;
    }

    return undefined;
}
