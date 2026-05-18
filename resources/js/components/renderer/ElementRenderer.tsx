import type { CanvasElement } from '../../domain/canvas/schema';
import { ImageElement } from './ImageElement';
import { InteractiveElement } from './InteractiveElement';
import { MusicElement } from './MusicElement';
import { StickerElement } from './StickerElement';
import { TextElement } from './TextElement';

type ElementRendererProps = {
    artboard: {
        width: number;
        height: number;
    };
    element: CanvasElement;
    onElementClick?: (element: CanvasElement) => void;
    onMediaDrop?: (element: CanvasElement, mediaItemId: string) => void;
    selectedElementId?: string | null;
};

export function ElementRenderer({ artboard, element, onElementClick, onMediaDrop, selectedElementId = null }: ElementRendererProps) {
    const style = {
        left: `${toPercent(element.x, artboard.width)}%`,
        top: `${toPercent(element.y, artboard.height)}%`,
        width: `${toPercent(element.w, artboard.width)}%`,
        height: `${toPercent(element.h, artboard.height)}%`,
        zIndex: element.z,
        transform: `rotate(${element.rotation}deg)`,
    };

    if (element.type === 'text') {
        return <TextElement element={element} style={style} />;
    }

    if (element.type === 'image') {
        return (
            <ImageElement
                element={element}
                onClick={onElementClick ? () => onElementClick(element) : undefined}
                onDropMedia={onMediaDrop ? (mediaItemId) => onMediaDrop(element, mediaItemId) : undefined}
                selected={selectedElementId === element.id}
                style={style}
            />
        );
    }

    if (element.type === 'sticker') {
        return <StickerElement element={element} style={style} />;
    }

    if (element.type === 'music') {
        return <MusicElement element={element} style={style} />;
    }

    if (element.type === 'interactive') {
        return <InteractiveElement element={element} style={style} />;
    }

    return (
        <div
            className="absolute flex items-center justify-center rounded-[4px] border border-dashed border-[#CBA980] bg-[#FFF7EEB3] px-2 text-center text-[10px] font-semibold uppercase text-[#7A5A43]"
            style={style}
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
