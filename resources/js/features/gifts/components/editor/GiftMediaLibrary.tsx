import { Check, ImageIcon, LoaderCircle, Upload } from 'lucide-react';
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
        <section aria-busy={uploading} className="gift-editor-media-library text-[#342E38]">
            <div className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4">
                <div>
                    <h3 className="text-sm font-bold text-[#21162D]">Adicionar fotos</h3>
                    <p className="mt-1 text-xs font-semibold text-[#746D78]">JPG, PNG ou WebP</p>
                </div>
                <button
                    aria-label={uploading ? 'Enviando imagem' : 'Enviar imagem'}
                    className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] border border-[#C94F39] bg-[#FF765B] px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#FF8B74] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#C9C1CD] disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
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

                {error ? (
                    <p
                        className="mt-3 rounded-[6px] border border-[#DFA69B] bg-[#FFF2EF] px-3 py-2.5 text-sm font-semibold text-[#7C3024]"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
            </div>

            <div
                aria-labelledby="gift-media-library-heading"
                className="gift-editor-inspector-section border-t border-[#DDD7E0] px-4 py-4"
            >
                <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-bold text-[#21162D]" id="gift-media-library-heading">
                        Fotos do presente
                    </h3>
                    <p className="shrink-0 text-xs font-semibold text-[#746D78]">
                        {imageCountLabel(mediaItems.length)}
                    </p>
                </div>

                {mediaItems.length > 0 ? (
                    <div className="gift-editor-media-grid grid grid-cols-3 gap-x-2 gap-y-3">
                        {mediaItems.map((mediaItem) => {
                            const selected = selectedMediaId === mediaItem.id;
                            const label = mediaItem.originalFilename ?? 'Imagem enviada';
                            const imageUrl = mediaItem.thumbnailUrl ?? mediaItem.url;

                            return (
                                <button
                                    aria-label={`Selecionar ${label}`}
                                    aria-pressed={selected}
                                    className="gift-editor-media-tile group min-w-0 text-left outline-none disabled:cursor-not-allowed disabled:opacity-45"
                                    disabled={disabled}
                                    key={mediaItem.id}
                                    onClick={() => onSelectMedia(mediaItem.id)}
                                    type="button"
                                >
                                    <span
                                        className={`relative block aspect-[4/3] overflow-hidden rounded-[3px] border-[3px] bg-[#EFEBF3] shadow-[2px_4px_8px_rgba(33,22,45,0.15)] transition duration-150 group-hover:-translate-y-0.5 group-focus-visible:ring-2 group-focus-visible:ring-[#21162D] group-focus-visible:ring-offset-2 motion-reduce:transform-none ${
                                            selected
                                                ? 'border-[#FF765B] ring-1 ring-[#C94F39]'
                                                : 'border-white ring-1 ring-[#C9C1CD]'
                                        }`}
                                    >
                                        {imageUrl ? (
                                            <img
                                                alt={label}
                                                className="h-full w-full object-cover"
                                                decoding="async"
                                                draggable={false}
                                                loading="lazy"
                                                src={imageUrl}
                                            />
                                        ) : (
                                            <span className="flex h-full w-full items-center justify-center text-[#746D78]">
                                                <ImageIcon aria-hidden="true" className="h-6 w-6" />
                                            </span>
                                        )}
                                        {selected ? (
                                            <span className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-[3px] bg-[#FF765B] text-[#21162D] shadow-[1px_2px_4px_rgba(33,22,45,0.18)]">
                                                <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="mt-1.5 block truncate px-0.5 text-[11px] font-bold text-[#4F4853]">
                                        {label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid min-h-36 place-content-center gap-2 border-y border-dashed border-[#C9C1CD] px-4 py-5 text-center text-sm font-semibold text-[#342E38]">
                        <ImageIcon aria-hidden="true" className="mx-auto h-6 w-6 text-[#746D78]" />
                        <span>Nenhuma imagem enviada ainda.</span>
                        <span className="text-xs font-medium text-[#645D68]">
                            Use Enviar imagem para guardar fotos neste presente.
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
});

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function imageCountLabel(count: number): string {
    if (count === 0) {
        return '0 imagens';
    }

    if (count === 1) {
        return '1 imagem';
    }

    return `${count} imagens`;
}

function errorMessage(payload: UploadResponse): string {
    const firstError = payload.errors
        ? Object.values(payload.errors)
              .flat()
              .find((message): message is string => typeof message === 'string' && message !== '')
        : null;

    return firstError ?? payload.message ?? 'Não foi possível enviar a imagem.';
}
