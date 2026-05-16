import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type TextElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function TextElement({ element, style }: TextElementProps) {
    const text = typeof element.text === 'string' ? element.text : '';

    return (
        <div className="absolute whitespace-pre-wrap break-words" style={style}>
            {text}
        </div>
    );
}
