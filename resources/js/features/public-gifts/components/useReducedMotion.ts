import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updatePreference = () => setPrefersReducedMotion(media.matches);

        updatePreference();
        media.addEventListener('change', updatePreference);

        return () => media.removeEventListener('change', updatePreference);
    }, []);

    return prefersReducedMotion;
}
