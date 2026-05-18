import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';

import {
    fontFamilyForToken,
    isRecord,
    normalizeThemeConfig,
    resolveThemeColor,
    type ThemeConfigInput,
} from '../../../../components/renderer/theme';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { textValueForElement } from './canvasTransformUtils';

type InlineTextEditorProps = {
    canvas: Canvas;
    disabled: boolean;
    element: CanvasElement;
    maxLength: number;
    onChangeText: (element: CanvasElement, value: string) => void;
    onClose: () => void;
    theme?: ThemeConfigInput;
};

export function InlineTextEditor({
    canvas,
    disabled,
    element,
    maxLength,
    onChangeText,
    onClose,
    theme,
}: InlineTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const normalizedTheme = normalizeThemeConfig(theme);
    const value = textValueForElement(element);
    const elementStyle = isRecord(element.style) ? element.style : {};
    const style = {
        left: `${toPercent(element.x, canvas.artboard.width)}%`,
        top: `${toPercent(element.y, canvas.artboard.height)}%`,
        width: `${toPercent(element.w, canvas.artboard.width)}%`,
        height: `${toPercent(element.h, canvas.artboard.height)}%`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: 3200,
    } as CSSProperties;
    const fontSize =
        typeof elementStyle.fontSize === 'number' && Number.isFinite(elementStyle.fontSize)
            ? `${(elementStyle.fontSize / canvas.artboard.width) * 100}cqw`
            : element.type === 'sticker'
              ? '3cqw'
              : '4.2cqw';
    const color = resolveThemeColor(
        normalizedTheme,
        elementStyle.color,
        element.type === 'sticker' ? normalizedTheme.tokens.colors.accent : normalizedTheme.elements.text.defaultColor,
    );
    const textAlign = safeTextAlign(elementStyle.align) ?? (element.type === 'sticker' ? 'center' : 'left');
    const fontFamily = fontFamilyForToken(normalizedTheme, elementStyle.fontToken);

    useEffect(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
    }, [element.id]);

    if (disabled) {
        return null;
    }

    return (
        <div className="absolute" style={style}>
            <textarea
                aria-label="Editar texto no canvas"
                className="h-full w-full resize-none overflow-hidden rounded-[6px] border-2 border-[#D93632] bg-[#FFF8EF]/95 px-2 py-1 text-inherit outline-none shadow-[0_0_0_2px_rgba(255,248,239,0.95),0_10px_26px_rgba(31,21,10,0.18)] focus:ring-2 focus:ring-[#D9363226]"
                maxLength={maxLength}
                onBlur={onClose}
                onChange={(event) => {
                    const nextValue = event.target.value;

                    onChangeText(element, nextValue);
                }}
                onKeyDown={handleKeyDown}
                onPointerDown={stopPointerEvent}
                onPointerMove={stopPointerEvent}
                onPointerUp={stopPointerEvent}
                ref={textareaRef}
                spellCheck
                style={{
                    color,
                    fontFamily,
                    fontSize,
                    lineHeight: 1.08,
                    textAlign,
                    whiteSpace: 'pre-wrap',
                }}
                value={value}
            />
        </div>
    );

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Escape') {
            event.preventDefault();
            onClose();

            return;
        }

        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onClose();
        }
    }
}

function stopPointerEvent(event: PointerEvent<HTMLTextAreaElement>) {
    event.stopPropagation();
}

function toPercent(value: number, total: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
        return 0;
    }

    return (value / total) * 100;
}

function safeTextAlign(value: unknown): 'left' | 'center' | 'right' | undefined {
    if (value === 'left' || value === 'center' || value === 'right') {
        return value;
    }

    return undefined;
}
