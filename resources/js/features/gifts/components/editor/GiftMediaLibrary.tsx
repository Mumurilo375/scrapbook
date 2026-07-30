import { ImageIcon, LoaderCircle, Upload } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

import type { EditorMediaItem, ImageUploadTarget } from './editorTypes';

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
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const payload = (await response.json().catch(() => ({}))) as UploadResponse;

            if (!response.ok || !payload.data) {
                setError(errorMessage(payload));

                return;
            }

            onUploaded(payload.data, uploadTargetRef.current);
        } catch {
            setError('Não foi possível enviar a imagem.');
        } finally {
            uploadTargetRef.current = null;
            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    function openLibraryUpload() {
        if (!disabled && !uploading) {
            uploadTargetRef.current = null;
            fileInputRef.current?.click();
        }
    }

    return (
        <section className="grid gap-4 text-[#342E38]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#21162D]">Fotos do presente</h3>
                    <p className="mt-1 text-sm text-[#746D78]">{imageCountLabel(mediaItems.length)}</p>
                </div>
                <button
                    aria-label={uploading ? 'Enviando imagem' : 'Enviar imagem'}
                    className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-[#C94F39] bg-[#FF765B] px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#FF8B74] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#C9C1CD] disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
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
                <p
                    className="rounded-[6px] border border-[#C85B47] bg-[#FFF2EF] px-3 py-2.5 text-sm font-semibold text-[#7C3024]"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}

            {mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {mediaItems.map((mediaItem) => (
                        <button
                            aria-label={`Selecionar ${mediaItem.originalFilename ?? 'imagem enviada'}`}
                            className={`aspect-square overflow-hidden rounded-[6px] border bg-[#EFEBF3] text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                selectedMediaId === mediaItem.id
                                    ? 'border-[#C94F39] ring-2 ring-[#FF765B66]'
                                    : 'border-[#978E9C] hover:border-[#21162D]'
                            }`}
                            disabled={disabled}
                            key={mediaItem.id}
                            onClick={() => onSelectMedia(mediaItem.id)}
                            type="button"
                        >
                            {(mediaItem.thumbnailUrl ?? mediaItem.url) ? (
                                <img
                                    alt={mediaItem.originalFilename ?? 'Imagem enviada'}
                                    className="h-full w-full object-cover"
                                    decoding="async"
                                    draggable={false}
                                    loading="lazy"
                                    src={mediaItem.thumbnailUrl ?? mediaItem.url}
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-[#746D78]">
                                    <ImageIcon aria-hidden="true" className="h-6 w-6" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid min-h-32 place-items-center gap-2 rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] px-4 py-5 text-center text-sm font-semibold text-[#342E38]">
                    <ImageIcon aria-hidden="true" className="h-6 w-6 text-[#746D78]" />
                    <span>Nenhuma imagem enviada ainda.</span>
                    <span className="text-xs font-medium text-[#645D68]">
                        Use Enviar imagem para guardar fotos neste presente.
                    </span>
                </div>
            )}
        </section>
    );
});

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function imageCountLabel(count: number): string {
    if (count === 0) {
        return 'Nenhuma imagem enviada';
    }

    if (count === 1) {
        return '1 imagem enviada';
    }

    return `${count} imagens enviadas`;
}

function errorMessage(payload: UploadResponse): string {
    const firstError = payload.errors
        ? Object.values(payload.errors)
              .flat()
              .find((message): message is string => typeof message === 'string' && message !== '')
        : null;

    return firstError ?? payload.message ?? 'Não foi possível enviar a imagem.';
}
