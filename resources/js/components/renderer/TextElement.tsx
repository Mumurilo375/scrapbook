import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import { fontFamilyForToken, isRecord, resolveThemeColor, type NormalizedThemeConfig } from './theme';

type TextElementProps = {
    artboard: {
        width: number;
        height: number;
    };
    element: CanvasElement;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function TextElement({ artboard, element, style, theme }: TextElementProps) {
    const text = typeof element.text === 'string' ? element.text : typeof element.content === 'string' ? element.content : '';
    const elementStyle = isRecord(element.style) ? element.style : {};
    const fontSize = typeof elementStyle.fontSize === 'number' ? `${(elementStyle.fontSize / artboard.width) * 100}cqw` : '4.2cqw';
    const fallbackColor = elementStyle.fontToken === 'title' || elementStyle.fontToken === 'heading'
        ? theme.elements.text.headingColor
        : theme.elements.text.defaultColor;
    const color = resolveThemeColor(theme, elementStyle.color, fallbackColor);
    const textAlign = typeof elementStyle.align === 'string' ? safeTextAlign(elementStyle.align) : undefined;
    const fontFamily = fontFamilyForToken(theme, elementStyle.fontToken);

    return (
        <div
            className="absolute whitespace-pre-wrap break-words"
            style={{
                ...style,
                color,
                fontFamily,
                fontSize,
                lineHeight: 1.08,
                textAlign,
            }}
        >
            {text}
        </div>
    );
}

function safeTextAlign(align: string): 'left' | 'center' | 'right' | undefined {
    if (align === 'left' || align === 'center' || align === 'right') {
        return align;
    }

    return undefined;
}
