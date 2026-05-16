import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type ImageElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function ImageElement({ element, style }: ImageElementProps) {
    const src = typeof element.src === 'string' ? element.src : undefined;
    const alt = typeof element.alt === 'string' ? element.alt : '';

    if (!src) {
        return <div className="absolute bg-[#f0d9ca]" style={style} />;
    }

    return <img alt={alt} className="absolute h-full w-full object-cover" src={src} style={style} />;
}
