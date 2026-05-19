import type { NormalizedThemeConfig } from '../../../components/renderer';
import type { BookViewMode } from './bookModeUtils';

export type BookMotionDirection = 'next' | 'previous' | 'none';

export function isBookMotionEnabled(theme: NormalizedThemeConfig, prefersReducedMotion: boolean): boolean {
    return theme.book.motion && !prefersReducedMotion && theme.book.transition !== 'none';
}

export function bookMotionAttributes(
    theme: NormalizedThemeConfig,
    direction: BookMotionDirection,
    mode: BookViewMode,
    enabled: boolean,
): Record<`data-${string}`, string> {
    return {
        'data-direction': direction,
        'data-intensity': theme.book.transitionIntensity,
        'data-motion': enabled ? 'on' : 'off',
        'data-transition': theme.book.transition,
        'data-view-mode': mode,
    };
}
