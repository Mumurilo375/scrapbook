import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type TextElementProps = {
    element: CanvasElement;
    style: CSSProperties;
};

export function TextElement({ element, style }: TextElementProps) {
    const text = typeof element.text === 'string' ? element.text : typeof element.content === 'string' ? element.content : '';
    const elementStyle = isRecord(element.style) ? element.style : {};
    const fontSize = typeof elementStyle.fontSize === 'number' ? elementStyle.fontSize : undefined;
    const color = typeof elementStyle.color === 'string' ? safeColor(elementStyle.color) : undefined;
    const textAlign = typeof elementStyle.align === 'string' ? safeTextAlign(elementStyle.align) : undefined;

    return (
        <div
            className="absolute whitespace-pre-wrap break-words leading-tight"
            style={{
                ...style,
                color,
                fontSize,
                textAlign,
            }}
        >
            {text}
        </div>
    );
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeColor(color: string): string | undefined {
    const tokens: Record<string, string> = {
        'var(--ink)': '#3A2618',
        'var(--paper)': '#FFF7EE',
        'var(--primary)': '#7A2634',
        'var(--rose)': '#B85F6B',
        'var(--wine)': '#7A2634',
    };

    if (tokens[color]) {
        return tokens[color];
    }

    if (/^#[0-9a-f]{3,8}$/i.test(color) || color.startsWith('var(--scrap-')) {
        return color;
    }

    return undefined;
}

function safeTextAlign(align: string): 'left' | 'center' | 'right' | undefined {
    if (align === 'left' || align === 'center' || align === 'right') {
        return align;
    }

    return undefined;
}
