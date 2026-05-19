import type { CSSProperties, DragEvent } from 'react';
import { useState } from 'react';
import type { CanvasElement } from '../../domain/canvas/schema';
import { isRecord, type NormalizedThemeConfig } from './theme';

const MEDIA_ITEM_DRAG_MIME = 'application/x-scrapbook-media-item-id';

type ImageElementProps = {
    element: CanvasElement;
    onClick?: () => void;
    onDropMedia?: (mediaItemId: string) => void;
    selected?: boolean;
    style: CSSProperties;
    theme: NormalizedThemeConfig;
};

export function ImageElement({ element, onClick, onDropMedia, selected = false, style, theme }: ImageElementProps) {
    const src = typeof element.src === 'string' ? safeImageSrc(element.src) : undefined;
    const alt = typeof element.alt === 'string' ? element.alt : '';
    const placeholderLabel =
        typeof element.placeholderLabel === 'string' && element.placeholderLabel.trim() !== ''
            ? element.placeholderLabel.trim()
            : 'Foto';
    const placeholderFontSize = placeholderLabel.length > 24 ? '2.1cqw' : '2.7cqw';
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const failed = Boolean(src && failedSrc === src);
    const interactiveClass = onClick ? 'cursor-pointer' : '';
    const selectedClass = selected
        ? 'ring-2 ring-[var(--scrap-accent)] ring-offset-2 ring-offset-[var(--scrap-paper)]'
        : '';
    const dragOverClass = dragOver
        ? 'border-[var(--scrap-leaf)] bg-[#E8F6F1] ring-2 ring-[var(--scrap-leaf)] ring-offset-2 ring-offset-[var(--scrap-paper)]'
        : '';
    const elementStyle = isRecord(element.style) ? element.style : {};
    const frame = typeof elementStyle.frame === 'string' ? elementStyle.frame : theme.elements.image.defaultFrame;
    const framed = frame === 'polaroid';
    const frameStyle = framed
        ? {
              backgroundColor: theme.tokens.colors.paper,
              borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 44%, transparent)`,
              boxShadow: theme.elements.image.shadow ? `0 14px 28px ${theme.tokens.colors.shadow}` : undefined,
              padding: '3.8%',
              paddingBottom: '10%',
          }
        : {};
    const dropHandlers = onDropMedia
        ? {
              onDragEnter: handleDragEnter,
              onDragLeave: handleDragLeave,
              onDragOver: handleDragOver,
              onDrop: handleDrop,
          }
        : {};

    if (!src || failed) {
        const placeholderStyle = {
            ...style,
            ...frameStyle,
            backgroundColor: framed
                ? theme.tokens.colors.paper
                : `color-mix(in srgb, ${theme.tokens.colors.paperAlt} 74%, white)`,
            backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.34), transparent 32%), radial-gradient(circle at 50% 42%, rgba(58,36,24,0.08), transparent 28%)',
            borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 56%, transparent)`,
            color: theme.tokens.colors.mutedInk,
            fontSize: placeholderFontSize,
        };

        if (!onClick) {
            return (
                <div
                    className={`absolute flex items-center justify-center rounded-[8px] border border-dashed px-2 text-center leading-tight font-semibold break-words uppercase ${selectedClass} ${dragOverClass}`}
                    style={placeholderStyle}
                    {...dropHandlers}
                >
                    {placeholderLabel}
                </div>
            );
        }

        return (
            <button
                aria-label="Selecionar espaço de imagem"
                className={`absolute flex items-center justify-center rounded-[8px] border border-dashed px-2 text-center leading-tight font-semibold break-words uppercase ${interactiveClass} ${selectedClass} ${dragOverClass}`}
                onClick={onClick}
                style={placeholderStyle}
                type="button"
                {...dropHandlers}
            >
                {placeholderLabel}
            </button>
        );
    }

    const imageFrameStyle = {
        ...style,
        ...frameStyle,
        borderColor: `color-mix(in srgb, ${theme.tokens.colors.muted} 36%, transparent)`,
    };

    if (!onClick) {
        return (
            <div
                className={`absolute overflow-hidden rounded-[8px] border ${selectedClass} ${dragOverClass}`}
                style={imageFrameStyle}
                {...dropHandlers}
            >
                <img
                    alt={alt}
                    className="h-full w-full rounded-[4px] object-cover"
                    decoding="async"
                    draggable={false}
                    loading="lazy"
                    onError={() => setFailedSrc(src)}
                    src={src}
                />
            </div>
        );
    }

    return (
        <button
            aria-label={alt !== '' ? `Selecionar imagem ${alt}` : 'Selecionar imagem'}
            className={`absolute overflow-hidden rounded-[8px] border ${interactiveClass} ${selectedClass} ${dragOverClass}`}
            onClick={onClick}
            style={imageFrameStyle}
            type="button"
            {...dropHandlers}
        >
            <img
                alt={alt}
                className="h-full w-full rounded-[4px] object-cover"
                decoding="async"
                draggable={false}
                loading="lazy"
                onError={() => setFailedSrc(src)}
                src={src}
            />
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
