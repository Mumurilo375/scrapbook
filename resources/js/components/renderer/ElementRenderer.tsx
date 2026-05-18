import type { CanvasElement } from '../../domain/canvas/schema';
import type { RendererAssetMap } from './assetTypes';
import { ImageElement } from './ImageElement';
import { InteractiveElement } from './InteractiveElement';
import { MusicElement } from './MusicElement';
import { StickerElement } from './StickerElement';
import { TextElement } from './TextElement';
import type { NormalizedThemeConfig } from './theme';

type ElementRendererProps = {
    artboard: {
        width: number;
        height: number;
    };
    element: CanvasElement;
    onElementClick?: (element: CanvasElement) => void;
    onMediaDrop?: (element: CanvasElement, mediaItemId: string) => void;
    selectedElementId?: string | null;
    assets?: RendererAssetMap;
    theme: NormalizedThemeConfig;
};

export function ElementRenderer({ artboard, assets, element, onElementClick, onMediaDrop, selectedElementId = null, theme }: ElementRendererProps) {
    const style = {
        left: `${toPercent(element.x, artboard.width)}%`,
        top: `${toPercent(element.y, artboard.height)}%`,
        width: `${toPercent(element.w, artboard.width)}%`,
        height: `${toPercent(element.h, artboard.height)}%`,
        zIndex: element.z,
        transform: `rotate(${element.rotation}deg)`,
    };

    if (element.type === 'text') {
        return <TextElement artboard={artboard} element={element} style={style} theme={theme} />;
    }

    if (element.type === 'image') {
        return (
            <ImageElement
                element={element}
                onClick={onElementClick ? () => onElementClick(element) : undefined}
                onDropMedia={onMediaDrop ? (mediaItemId) => onMediaDrop(element, mediaItemId) : undefined}
                selected={selectedElementId === element.id}
                style={style}
                theme={theme}
            />
        );
    }

    if (element.type === 'sticker') {
        return <StickerElement artboard={artboard} assets={assets} element={element} style={style} theme={theme} />;
    }

    if (element.type === 'music') {
        return <MusicElement element={element} style={style} theme={theme} />;
    }

    if (element.type === 'interactive') {
        return <InteractiveElement element={element} style={style} theme={theme} />;
    }

    return (
        <div
            className="absolute flex items-center justify-center border border-dashed px-2 text-center font-semibold uppercase"
            style={{
                ...style,
                backgroundColor: `color-mix(in srgb, ${theme.tokens.colors.paper} 82%, white)`,
                borderColor: theme.tokens.colors.muted,
                borderRadius: 8,
                color: theme.tokens.colors.mutedInk,
                fontSize: '2.4cqw',
            }}
        >
            Elemento
        </div>
    );
}

function toPercent(value: number, total: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
        return 0;
    }

    return (value / total) * 100;
}
