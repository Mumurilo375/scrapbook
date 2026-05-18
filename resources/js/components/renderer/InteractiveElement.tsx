import type { CSSProperties } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import type { NormalizedThemeConfig } from './theme';

type InteractiveElementProps = {
    element: CanvasElement;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function InteractiveElement({ element, style, theme }: InteractiveElementProps) {
    const label = typeof element.label === 'string' ? element.label : '';

    return (
        <button
            className="absolute rounded-[10px] border px-3 font-semibold"
            style={{
                ...style,
                backgroundColor: theme.tokens.colors.paperAlt,
                borderColor: theme.tokens.colors.muted,
                color: theme.tokens.colors.ink,
                fontSize: '3cqw',
            }}
            type="button"
        >
            {label}
        </button>
    );
}
