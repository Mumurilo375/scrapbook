import { ImageIcon, LoaderCircle, Upload } from 'lucide-react';
import type { DragEvent } from 'react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import type { EditorMediaItem, ImageUploadTarget } from './editorTypes';

const MEDIA_ITEM_DRAG_MIME = 'application/x-scrapbook-media-item-id';

export type GiftMediaLibraryHandle = {
    openFilePicker: (target?: ImageUploadTarget | null) => void;
};

type GiftMediaLibraryProps = {
    disabled: boolean;
    mediaItems: EditorMediaItem[];
    onUploaded: (mediaItem: EditorMediaItem, target: ImageUploadTarget | null) => void;
    onSelectMedia: (mediaItemId: string) => void;
    selectedMediaId: string | null;
    uploadUrl: string;
};

type UploadResponse = {
    data?: EditorMediaItem;
    message?: string;
    errors?: Record<string, string[] | string>;
};

export const GiftMediaLibrary = forwardRef<GiftMediaLibraryHandle, GiftMediaLibraryProps>(function GiftMediaLibrary(
    { disabled, mediaItems, onSelectMedia, onUploaded, selectedMediaId, uploadUrl },
    ref,
) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const uploadTargetRef = useRef<ImageUploadTarget | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(
        ref,
        () => ({
            openFilePicker: (target = null) => {
                if (!disabled && !uploading) {
                    uploadTargetRef.current = target;
                    fileInputRef.current?.click();
                }
            },
        }),
        [disabled, uploading],
    );

    async function uploadSelectedFile(file: File | null) {
        if (!file || disabled) {
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        setError(null);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
            });
            const payload = (await response.json().catch(() => ({}))) as UploadResponse;

            if (!response.ok || !payload.data) {
                setError(errorMessage(payload));

                return;
            }

            onUploaded(payload.data, uploadTargetRef.current);
            uploadTargetRef.current = null;

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch {
            setError('Não foi possível enviar a imagem.');
        } finally {
            setUploading(false);
        }
    }

    function openLibraryUpload() {
        if (!disabled && !uploading) {
            uploadTargetRef.current = null;
            fileInputRef.current?.click();
        }
    }

    function startMediaDrag(event: DragEvent<HTMLButtonElement>, mediaItem: EditorMediaItem) {
        if (disabled) {
            event.preventDefault();

            return;
        }

        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData(MEDIA_ITEM_DRAG_MIME, mediaItem.id);
        event.dataTransfer.setData('text/plain', mediaItem.id);
        onSelectMedia(mediaItem.id);
    }

    return (
        <section className="grid gap-3 text-[#1F150A]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-[#7A2634]">Biblioteca do presente</h3>
                    <p className="mt-1 text-sm text-[#6F5A4A]">{mediaItems.length} imagem(ns) enviada(s)</p>
                </div>
                <button
                    className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] shadow-sm transition hover:bg-[#F6E4CF] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={disabled || uploading}
                    onClick={openLibraryUpload}
                    type="button"
                >
                    {uploading ? (
                        <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
                    ) : (
                        <Upload aria-hidden="true" className="h-5 w-5" />
                    )}
                    <span>Enviar imagem</span>
                </button>
                <input
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={disabled || uploading}
                    onChange={(event) => uploadSelectedFile(event.target.files?.[0] ?? null)}
                    type="file"
                />
            </div>

            {error ? (
                <p className="mt-3 rounded-[6px] border border-[#D99A8B] bg-[#FFF0EC] px-3 py-2 text-sm font-semibold text-[#8A2E21]">
                    {error}
                </p>
            ) : null}

            {mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {mediaItems.map((mediaItem) => (
                        <button
                            className={`aspect-square cursor-grab overflow-hidden rounded-[6px] border bg-[#EAD2B8] text-left shadow-sm transition active:cursor-grabbing disabled:cursor-not-allowed ${
                                selectedMediaId === mediaItem.id
                                    ? 'border-[#7A2634] ring-2 ring-[#7A26344D]'
                                    : 'border-[#D8B991] hover:border-[#A86F55]'
                            }`}
                            disabled={disabled}
                            draggable={!disabled}
                            key={mediaItem.id}
                            onDragStart={(event) => startMediaDrag(event, mediaItem)}
                            onClick={() => onSelectMedia(mediaItem.id)}
                            type="button"
                        >
                            {(mediaItem.thumbnailUrl ?? mediaItem.url) ? (
                                <img
                                    alt={mediaItem.originalFilename ?? 'Imagem enviada'}
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                    src={mediaItem.thumbnailUrl ?? mediaItem.url}
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-[#7A5A43]">
                                    <ImageIcon aria-hidden="true" className="h-6 w-6" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex min-h-28 items-center justify-center rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] px-4 text-center text-sm font-semibold text-[#6F5A4A]">
                    Nenhuma imagem enviada.
                </div>
            )}
        </section>
    );
});

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function errorMessage(payload: UploadResponse): string {
    const firstError = payload.errors
        ? Object.values(payload.errors)
              .flat()
              .find((message): message is string => typeof message === 'string' && message !== '')
        : null;

    return firstError ?? payload.message ?? 'Não foi possível enviar a imagem.';
}
