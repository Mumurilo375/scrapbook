import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

type ImageElementProps = {
    element: CanvasElement;
    onClick?: () => void;
    selected?: boolean;
    style: CSSProperties;
};

export function ImageElement({ element, onClick, selected = false, style }: ImageElementProps) {
    const src = typeof element.src === 'string' ? safeImageSrc(element.src) : undefined;
    const alt = typeof element.alt === 'string' ? element.alt : '';
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const failed = Boolean(src && failedSrc === src);
    const interactiveClass = onClick ? 'cursor-pointer' : '';
    const selectedClass = selected ? 'ring-2 ring-[#7A2634] ring-offset-2 ring-offset-[#FFF7EE]' : '';

    if (!src || failed) {
        if (!onClick) {
            return (
                <div
                    className={`absolute flex items-center justify-center rounded-[4px] border border-dashed border-[#CBA980] bg-[#EED8CC] px-2 text-center text-[10px] font-semibold uppercase text-[#7A5A43] ${selectedClass}`}
                    style={style}
                >
                    Imagem
                </div>
            );
        }

        return (
            <button
                aria-label="Selecionar espaço de imagem"
                className={`absolute flex items-center justify-center rounded-[4px] border border-dashed border-[#CBA980] bg-[#EED8CC] px-2 text-center text-[10px] font-semibold uppercase text-[#7A5A43] ${interactiveClass} ${selectedClass}`}
                onClick={onClick}
                style={style}
                type="button"
            >
                Imagem
            </button>
        );
    }

    if (!onClick) {
        return <img alt={alt} className={`absolute h-full w-full object-cover ${selectedClass}`} onError={() => setFailedSrc(src)} src={src} style={style} />;
    }

    return (
        <button
            aria-label={alt !== '' ? `Selecionar imagem ${alt}` : 'Selecionar imagem'}
            className={`absolute overflow-hidden rounded-[4px] ${interactiveClass} ${selectedClass}`}
            onClick={onClick}
            style={style}
            type="button"
        >
            <img alt={alt} className="h-full w-full object-cover" onError={() => setFailedSrc(src)} src={src} />
        </button>
    );
}

function safeImageSrc(src: string): string | undefined {
    if (src.startsWith('/') && !src.startsWith('//')) {
        return src;
    }

    return undefined;
}
