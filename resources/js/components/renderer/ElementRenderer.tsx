import type { CanvasElement } from '../../domain/canvas/schema';
import { ImageElement } from './ImageElement';
import { InteractiveElement } from './InteractiveElement';
import { MusicElement } from './MusicElement';
import { StickerElement } from './StickerElement';
import { TextElement } from './TextElement';

type ElementRendererProps = {
    element: CanvasElement;
};

export function ElementRenderer({ element }: ElementRendererProps) {
    const style = {
        left: element.x,
        top: element.y,
        width: element.w,
        height: element.h,
        zIndex: element.z,
        transform: `rotate(${element.rotation}deg)`,
    };

    if (element.type === 'text') {
        return <TextElement element={element} style={style} />;
    }

    if (element.type === 'image') {
        return <ImageElement element={element} style={style} />;
    }

    if (element.type === 'sticker') {
        return <StickerElement element={element} style={style} />;
    }

    if (element.type === 'music') {
        return <MusicElement element={element} style={style} />;
    }

    return <InteractiveElement element={element} style={style} />;
}
