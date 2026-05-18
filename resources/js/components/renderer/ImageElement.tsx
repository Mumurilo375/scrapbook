import type { CSSProperties, DragEvent } from 'react';
import { useState } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';

const MEDIA_ITEM_DRAG_MIME = 'application/x-scrapbook-media-item-id';

type ImageElementProps = {
    element: CanvasElement;
    onClick?: () => void;
    onDropMedia?: (mediaItemId: string) => void;
    selected?: boolean;
    style: CSSProperties;
};

export function ImageElement({ element, onClick, onDropMedia, selected = false, style }: ImageElementProps) {
    const src = typeof element.src === 'string' ? safeImageSrc(element.src) : undefined;
    const alt = typeof element.alt === 'string' ? element.alt : '';
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const failed = Boolean(src && failedSrc === src);
    const interactiveClass = onClick ? 'cursor-pointer' : '';
    const selectedClass = selected ? 'ring-2 ring-[#7A2634] ring-offset-2 ring-offset-[#FFF7EE]' : '';
    const dragOverClass = dragOver ? 'border-[#167A6A] bg-[#E8F6F1] ring-2 ring-[#167A6A] ring-offset-2 ring-offset-[#FFF7EE]' : '';
    const dropHandlers = onDropMedia
        ? {
              onDragEnter: handleDragEnter,
              onDragLeave: handleDragLeave,
              onDragOver: handleDragOver,
              onDrop: handleDrop,
          }
        : {};

    if (!src || failed) {
        if (!onClick) {
            return (
                <div
                    className={`absolute flex items-center justify-center rounded-[4px] border border-dashed border-[#CBA980] bg-[#EED8CC] px-2 text-center text-[10px] font-semibold uppercase text-[#7A5A43] ${selectedClass} ${dragOverClass}`}
                    style={style}
                    {...dropHandlers}
                >
                    Imagem
                </div>
            );
        }

        return (
            <button
                aria-label="Selecionar espaço de imagem"
                className={`absolute flex items-center justify-center rounded-[4px] border border-dashed border-[#CBA980] bg-[#EED8CC] px-2 text-center text-[10px] font-semibold uppercase text-[#7A5A43] ${interactiveClass} ${selectedClass} ${dragOverClass}`}
                onClick={onClick}
                style={style}
                type="button"
                {...dropHandlers}
            >
                Imagem
            </button>
        );
    }

    if (!onClick) {
        return (
            <div className={`absolute overflow-hidden rounded-[4px] ${selectedClass} ${dragOverClass}`} style={style} {...dropHandlers}>
                <img alt={alt} className="h-full w-full object-cover" draggable={false} onError={() => setFailedSrc(src)} src={src} />
            </div>
        );
    }

    return (
        <button
            aria-label={alt !== '' ? `Selecionar imagem ${alt}` : 'Selecionar imagem'}
            className={`absolute overflow-hidden rounded-[4px] ${interactiveClass} ${selectedClass} ${dragOverClass}`}
            onClick={onClick}
            style={style}
            type="button"
            {...dropHandlers}
        >
            <img alt={alt} className="h-full w-full object-cover" draggable={false} onError={() => setFailedSrc(src)} src={src} />
        </button>
    );

    function handleDragEnter(event: DragEvent<HTMLElement>) {
        if (!hasMediaDrag(event)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        setDragOver(true);
    }

    function handleDragLeave(event: DragEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
        setDragOver(false);
    }

    function handleDragOver(event: DragEvent<HTMLElement>) {
        if (!hasMediaDrag(event)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'copy';
        setDragOver(true);
    }

    function handleDrop(event: DragEvent<HTMLElement>) {
        if (!onDropMedia) {
            return;
        }

        const mediaItemId = draggedMediaItemId(event);
        setDragOver(false);

        if (!mediaItemId) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        onDropMedia(mediaItemId);
    }
}

function safeImageSrc(src: string): string | undefined {
    if (src.startsWith('/') && !src.startsWith('//')) {
        return src;
    }

    return undefined;
}

function hasMediaDrag(event: DragEvent<HTMLElement>): boolean {
    return Array.from(event.dataTransfer.types).includes(MEDIA_ITEM_DRAG_MIME);
}

function draggedMediaItemId(event: DragEvent<HTMLElement>): string | null {
    const customValue = event.dataTransfer.getData(MEDIA_ITEM_DRAG_MIME);
    const fallbackValue = event.dataTransfer.getData('text/plain');
    const mediaItemId = (customValue || fallbackValue).trim();

    return mediaItemId === '' ? null : mediaItemId;
}
