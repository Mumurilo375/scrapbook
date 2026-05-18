import type { FormDataConvertible } from '@inertiajs/core';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

import { CanvasElementInspector } from '../../components/editor/CanvasElementInspector';
import { GiftImageElementEditor } from '../../components/editor/GiftImageElementEditor';
import { GiftEditorLayout } from '../../components/editor/GiftEditorLayout';
import { GiftEditorSaveBar } from '../../components/editor/GiftEditorSaveBar';
import { GiftEditorTopBar } from '../../components/editor/GiftEditorTopBar';
import { GiftMediaLibrary, type GiftMediaLibraryHandle } from '../../components/editor/GiftMediaLibrary';
import { GiftMetadataPanel, type GiftMetadataDraft } from '../../components/editor/GiftMetadataPanel';
import { GiftPagePreview } from '../../components/editor/GiftPagePreview';
import { GiftPageSidebar } from '../../components/editor/GiftPageSidebar';
import { GiftTextElementEditor } from '../../components/editor/GiftTextElementEditor';
import type {
    EditorMediaItem,
    EditorPage,
    EditorSaveState,
    EditableTextElement,
} from '../../components/editor/editorTypes';
import {
    applyMediaToImageElement,
    canvasesAreEqual,
    cloneCanvas,
    imageElementsFromCanvas,
    normalizeCanvas,
    textElementsFromCanvas,
    updateCanvasText,
} from '../../components/editor/editorUtils';
import { formatDate } from '../../components/formatters';
import type { EditableGift, GiftPageSummary } from '../../types';

type GiftEditProps = {
    gift: EditableGift;
    media: EditorMediaItem[];
    pages: GiftPageSummary[];
};

export default function GiftEdit({ gift, media, pages }: GiftEditProps) {
    const editorPages = useMemo<EditorPage[]>(
        () =>
            pages.map((page) => ({
                ...page,
                canvas: normalizeCanvas(page.canvas),
            })),
        [pages],
    );
    const [selectedPageId, setSelectedPageId] = useState<string | null>(editorPages[0]?.id ?? null);
    const [pageCanvases, setPageCanvases] = useState<Record<string, EditorPage['canvas']>>(() =>
        Object.fromEntries(editorPages.map((page) => [page.id, cloneCanvas(page.canvas)])),
    );
    const [savedCanvases, setSavedCanvases] = useState<Record<string, EditorPage['canvas']>>(() =>
        Object.fromEntries(editorPages.map((page) => [page.id, cloneCanvas(page.canvas)])),
    );
    const [pageSaveState, setPageSaveState] = useState<EditorSaveState>('idle');
    const [pageError, setPageError] = useState<string | null>(null);
    const [mediaItems, setMediaItems] = useState<EditorMediaItem[]>(media);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(media[0]?.id ?? null);
    const [selectedImageElementId, setSelectedImageElementId] = useState<string | null>(null);
    const mediaLibraryRef = useRef<GiftMediaLibraryHandle | null>(null);
    const uploadTargetImageElementIdRef = useRef<string | null>(null);

    const initialMetadata = metadataFromGift(gift);
    const [metadata, setMetadata] = useState<GiftMetadataDraft>(initialMetadata);
    const [savedMetadata, setSavedMetadata] = useState<GiftMetadataDraft>(initialMetadata);
    const [metadataSaving, setMetadataSaving] = useState(false);
    const [metadataSaved, setMetadataSaved] = useState(false);
    const [metadataErrors, setMetadataErrors] = useState<Partial<Record<keyof GiftMetadataDraft, string>>>({});

    const selectedPageIndex = editorPages.findIndex((page) => page.id === selectedPageId);
    const selectedPage = selectedPageIndex >= 0 ? editorPages[selectedPageIndex] : null;
    const selectedCanvas = selectedPage ? (pageCanvases[selectedPage.id] ?? selectedPage.canvas) : null;
    const savedCanvas = selectedPage ? (savedCanvases[selectedPage.id] ?? selectedPage.canvas) : null;
    const pageIsDirty = Boolean(selectedCanvas && savedCanvas && !canvasesAreEqual(selectedCanvas, savedCanvas));
    const effectivePageSaveState = pageSaveState === 'idle' && pageIsDirty ? 'dirty' : pageSaveState;
    const textElements =
        selectedCanvas && selectedPage ? textElementsFromCanvas(selectedCanvas, selectedPage.text_max_length) : [];
    const imageElements = selectedCanvas ? imageElementsFromCanvas(selectedCanvas) : [];
    const activeImageElementId =
        selectedImageElementId && imageElements.some((element) => element.id === selectedImageElementId)
            ? selectedImageElementId
            : (imageElements[0]?.id ?? null);
    const metadataDirty = !metadataEquals(metadata, savedMetadata);
    const canSavePage = Boolean(selectedPage && selectedCanvas && !selectedPage.locked && pageIsDirty);
    const editorDisabled = Boolean(selectedPage?.locked || gift.status !== 'draft');

    function selectPage(pageId: string) {
        setSelectedPageId(pageId);
        setPageError(null);
        setPageSaveState('idle');
        setSelectedImageElementId(null);
    }

    function goToPage(offset: number) {
        const nextPage = editorPages[selectedPageIndex + offset];

        if (nextPage) {
            selectPage(nextPage.id);
        }
    }

    function changeText(element: EditableTextElement, value: string) {
        if (!selectedPage || !selectedCanvas) {
            return;
        }

        setPageCanvases((current) => ({
            ...current,
            [selectedPage.id]: updateCanvasText(selectedCanvas, element.id, element.field, value),
        }));
        setPageError(null);
        setPageSaveState('dirty');
    }

    function applySelectedMediaToImage() {
        if (!selectedPage || !activeImageElementId) {
            return;
        }

        const mediaItem = mediaItems.find((item) => item.id === selectedMediaId);

        if (!mediaItem) {
            return;
        }

        setPageCanvases((current) => ({
            ...current,
            [selectedPage.id]: applyMediaToImageElement(
                current[selectedPage.id] ?? selectedCanvas ?? selectedPage.canvas,
                activeImageElementId,
                mediaItem,
            ),
        }));
        setPageError(null);
        setPageSaveState('dirty');
    }

    function addUploadedMedia(mediaItem: EditorMediaItem) {
        setMediaItems((current) => [mediaItem, ...current.filter((item) => item.id !== mediaItem.id)]);
        setSelectedMediaId(mediaItem.id);

        const targetImageElementId = uploadTargetImageElementIdRef.current ?? activeImageElementId;
        uploadTargetImageElementIdRef.current = null;

        if (!selectedPage || !targetImageElementId) {
            return;
        }

        setPageCanvases((current) => ({
            ...current,
            [selectedPage.id]: applyMediaToImageElement(
                current[selectedPage.id] ?? selectedCanvas ?? selectedPage.canvas,
                targetImageElementId,
                mediaItem,
            ),
        }));
        setPageError(null);
        setPageSaveState('dirty');
    }

    function selectImageElementFromPreview(elementId: string) {
        setSelectedImageElementId(elementId);
        uploadTargetImageElementIdRef.current = elementId;
        mediaLibraryRef.current?.openFilePicker();
    }

    function applyMediaToImageElementFromDrop(elementId: string, mediaItemId: string) {
        if (!selectedPage) {
            return;
        }

        const mediaItem = mediaItems.find((item) => item.id === mediaItemId);

        if (!mediaItem) {
            return;
        }

        setSelectedImageElementId(elementId);
        setSelectedMediaId(mediaItem.id);
        setPageCanvases((current) => ({
            ...current,
            [selectedPage.id]: applyMediaToImageElement(
                current[selectedPage.id] ?? selectedCanvas ?? selectedPage.canvas,
                elementId,
                mediaItem,
            ),
        }));
        setPageError(null);
        setPageSaveState('dirty');
    }

    function savePage() {
        if (!selectedPage || !selectedCanvas || selectedPage.locked) {
            return;
        }

        setPageSaveState('saving');
        setPageError(null);

        router.patch(
            selectedPage.update_url,
            { canvas: selectedCanvas as unknown as FormDataConvertible },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setPageError(firstError(errors) ?? 'Não foi possível salvar esta página.');
                    setPageSaveState('error');
                },
                onSuccess: () => {
                    setSavedCanvases((current) => ({
                        ...current,
                        [selectedPage.id]: cloneCanvas(selectedCanvas),
                    }));
                    setPageSaveState('saved');
                },
            },
        );
    }

    function changeMetadata(field: keyof GiftMetadataDraft, value: string) {
        setMetadata((current) => ({ ...current, [field]: value }));
        setMetadataErrors({});
        setMetadataSaved(false);
    }

    function saveMetadata() {
        setMetadataSaving(true);
        setMetadataSaved(false);
        setMetadataErrors({});

        router.patch(gift.update_url, metadata, {
            preserveScroll: true,
            onError: (errors) => {
                setMetadataErrors({
                    title: typeof errors.title === 'string' ? errors.title : undefined,
                    recipient_name: typeof errors.recipient_name === 'string' ? errors.recipient_name : undefined,
                    sender_name: typeof errors.sender_name === 'string' ? errors.sender_name : undefined,
                });
            },
            onFinish: () => setMetadataSaving(false),
            onSuccess: () => {
                setSavedMetadata(metadata);
                setMetadataSaved(true);
            },
        });
    }

    return (
        <>
            <Head title={`Editar ${metadata.title}`} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <GiftEditorTopBar
                    dashboardUrl={gift.dashboard_url}
                    orderUrl={gift.order_url}
                    pageSaveState={effectivePageSaveState}
                    previewUrl={gift.preview_url}
                    publicUrl={gift.public_url}
                    reviewUrl={gift.review_url}
                    status={gift.status}
                    title={metadata.title}
                />

                <GiftEditorLayout
                    left={
                        <GiftPageSidebar
                            onSelectPage={selectPage}
                            pages={editorPages}
                            selectedPageId={selectedPageId}
                        />
                    }
                    center={
                        <GiftPagePreview
                            canGoNext={selectedPageIndex < editorPages.length - 1}
                            canGoPrevious={selectedPageIndex > 0}
                            canvas={selectedCanvas}
                            onDropMediaOnImage={applyMediaToImageElementFromDrop}
                            onNext={() => goToPage(1)}
                            onPrevious={() => goToPage(-1)}
                            onSelectImageElement={selectImageElementFromPreview}
                            page={selectedPage}
                            selectedImageElementId={activeImageElementId}
                        />
                    }
                    right={
                        <div className="grid gap-4 lg:sticky lg:top-24">
                            <GiftMetadataPanel
                                dirty={metadataDirty}
                                disabled={gift.status !== 'draft'}
                                errors={metadataErrors}
                                metadata={metadata}
                                onChange={changeMetadata}
                                onSave={saveMetadata}
                                saved={metadataSaved}
                                saving={metadataSaving}
                            />
                            <GiftTextElementEditor
                                disabled={editorDisabled}
                                elements={textElements}
                                onChangeText={changeText}
                            />
                            <GiftMediaLibrary
                                disabled={editorDisabled}
                                mediaItems={mediaItems}
                                onSelectMedia={setSelectedMediaId}
                                onUploaded={addUploadedMedia}
                                ref={mediaLibraryRef}
                                selectedMediaId={selectedMediaId}
                                uploadUrl={gift.media_store_url}
                            />
                            <GiftImageElementEditor
                                disabled={editorDisabled}
                                elements={imageElements}
                                mediaItems={mediaItems}
                                onApplyMedia={applySelectedMediaToImage}
                                onSelectElement={setSelectedImageElementId}
                                selectedElementId={activeImageElementId}
                                selectedMediaId={selectedMediaId}
                            />
                            <GiftEditorSaveBar
                                disabled={!canSavePage}
                                error={pageError}
                                onSave={savePage}
                                saveState={effectivePageSaveState}
                            />
                            <GiftSummary gift={gift} />
                            <CanvasElementInspector canvas={selectedCanvas} />
                        </div>
                    }
                />
            </main>
        </>
    );
}

type GiftSummaryProps = {
    gift: EditableGift;
};

function GiftSummary({ gift }: GiftSummaryProps) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 text-sm text-[#42291D] shadow-sm">
            <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Resumo</h2>
            <dl className="mt-3 grid gap-2">
                <Info label="Ocasião" value={gift.occasion?.name ?? 'Sem ocasião'} />
                <Info label="Template" value={gift.template?.name ?? 'Sem template'} />
                <Info label="Tema" value={gift.theme?.name ?? 'Sem tema'} />
                <Info label="Última edição" value={formatDate(gift.last_edited_at)} />
            </dl>
        </section>
    );
}

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div>
            <dt className="font-semibold text-[#1F150A]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
        </div>
    );
}

function metadataFromGift(gift: EditableGift): GiftMetadataDraft {
    return {
        title: gift.title,
        recipient_name: gift.recipient_name ?? '',
        sender_name: gift.sender_name ?? '',
    };
}

function metadataEquals(left: GiftMetadataDraft, right: GiftMetadataDraft): boolean {
    return (
        left.title === right.title &&
        left.recipient_name === right.recipient_name &&
        left.sender_name === right.sender_name
    );
}

function firstError(errors: Record<string, string>): string | null {
    return Object.values(errors).find(Boolean) ?? null;
}
