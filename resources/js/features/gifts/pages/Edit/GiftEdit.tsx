/*
THESIS: O editor é uma bancada de encadernação; recusa a folha isolada dentro de um dashboard.
OWN-WORLD: Tecido berinjela, bancada lavanda, inspector branco e álbum aberto de algodão, couro, metal e fita.
STORY: A pessoa percorre Layout, Preencher, Decorar e Ajustar até concluir um presente bonito sem saber design.
FIRST VIEWPORT: Barra de 72px, livro aberto ocupando o palco, páginas encaixadas e inspector contextual à direita.
FORM: Ateliê do Álbum Aberto, composição híbrida das três referências aprovadas; seed dispensado pela direção fixada.
*/
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { assetMapFromList, resolveAssetDefaultTransform } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { ElementPropertiesPanel } from '../../components/editor/ElementPropertiesPanel';
import { EditorTabs } from '../../components/editor/EditorTabs';
import { GiftAssetsPanel } from '../../components/editor/GiftAssetsPanel';
import { GiftContentPanel } from '../../components/editor/GiftContentPanel';
import { GiftDebugPanel } from '../../components/editor/GiftDebugPanel';
import { GiftEditorLayout } from '../../components/editor/GiftEditorLayout';
import { GiftEditorTopBar } from '../../components/editor/GiftEditorTopBar';
import { GiftImagesPanel } from '../../components/editor/GiftImagesPanel';
import {
    GiftInteractiveElementsPanel,
    type InteractiveElementKind,
} from '../../components/editor/GiftInteractiveElementsPanel';
import { GiftLayersPanel } from '../../components/editor/GiftLayersPanel';
import type { GiftMediaLibraryHandle } from '../../components/editor/GiftMediaLibrary';
import { GiftMetadataPanel, type GiftMetadataDraft } from '../../components/editor/GiftMetadataPanel';
import { GiftPageBackgroundPanel } from '../../components/editor/GiftPageBackgroundPanel';
import { GiftPagePreview } from '../../components/editor/GiftPagePreview';
import { GiftPageSidebar } from '../../components/editor/GiftPageSidebar';
import {
    isElementHidden,
    isElementLocked,
    isTransformableElement,
    patchCanvasElement,
    patchElementStyle,
    textFieldForElement,
    type ElementPatch,
} from '../../components/editor/canvasTransformUtils';
import type {
    EditableTextElement,
    EditorAsset,
    EditorAssetCategory,
    EditorMediaItem,
    EditorPage,
    EditorTab,
    ImageUploadTarget,
    SaveStatus,
} from '../../components/editor/editorTypes';
import {
    applyMediaToImageElement,
    canvasesAreEqual,
    cloneCanvas,
    normalizeCanvas,
    textElementsFromCanvas,
    updateCanvasText,
} from '../../components/editor/editorUtils';
import {
    applyLayerAction,
    deleteElement,
    duplicateElement,
    normalizeCanvasLayerOrder,
    renameElement,
    toggleHidden,
    toggleLocked,
    type LayerAction,
} from '../../components/editor/layerUtils';
import { isDecorativeAsset } from '../../components/editor/pageBackgroundAssets';
import { useEditorHistory } from '../../components/editor/useEditorHistory';
import {
    AutosaveRequestError,
    clearLocalDraft,
    debugAutosave,
    firstAutosaveError,
    patchJson,
    readLocalDraft,
    useAutosave,
    useOnlineStatus,
    writeLocalDraft,
    type LocalDraft,
} from '../../components/editor/useAutosave';
import { useCanvasSelection } from '../../components/editor/useCanvasSelection';
import type { TransformMode } from '../../components/editor/useElementTransform';
import { useUnsavedChangesWarning } from '../../components/editor/useUnsavedChangesWarning';
import type { EditableGift, GiftPageSummary } from '../../types';

type GiftEditProps = {
    assets?: EditorAsset[];
    debugEnabled: boolean;
    gift: EditableGift;
    media: EditorMediaItem[];
    pages: GiftPageSummary[];
};

type AutosaveResponse<TData> = {
    data: TData;
    success: boolean;
};

type MetadataSaveData = {
    gift: {
        last_edited_at: string | null;
        recipient_name: string | null;
        sender_name: string | null;
        title: string;
    };
};

type PageSaveData = {
    page: {
        canvas: Canvas | Record<string, unknown>;
        id: string;
        updated_at: string | null;
    };
};

type AssetIndexResponse = {
    data: {
        assets: EditorAsset[];
        categories: EditorAssetCategory[];
    };
    success: boolean;
};

type PageBackgroundIndexResponse = {
    data: {
        pageBackgrounds: EditorAsset[];
    };
    success: boolean;
};

type AssetLibraryStatus = 'loading' | 'ready' | 'error';
type PageBackgroundLibraryStatus = 'loading' | 'ready' | 'error';

type ImageUploadResponse = {
    data?: EditorMediaItem;
    errors?: Record<string, string[] | string>;
    message?: string;
};

type CanvasHistoryMode = 'debounce' | 'push' | 'skip';

type UpdatePageCanvasOptions = {
    groupKey?: string;
    history?: CanvasHistoryMode;
    label?: string;
};

type TransformHistorySession = {
    before: Canvas;
    elementId: string;
    mode: TransformMode;
    pageId: string;
};

export default function GiftEdit({ assets: initialAssets = [], debugEnabled, gift, media, pages }: GiftEditProps) {
    const editorPages = useMemo<EditorPage[]>(
        () =>
            pages.map((page) => ({
                ...page,
                canvas: normalizeCanvas(page.canvas),
            })),
        [pages],
    );
    const editorPageById = useMemo(() => new Map(editorPages.map((page) => [page.id, page] as const)), [editorPages]);
    const initialMetadata = useMemo(() => metadataFromGift(gift), [gift]);
    const localDraftRecovery = useMemo(() => {
        const errors: string[] = [];
        const key = metadataDraftKey(gift.id);
        const metadataDraft = readLocalDraft<GiftMetadataDraft>(key, {
            onError: () => errors.push('Não foi possível recuperar os dados do presente salvos neste navegador.'),
        });
        const pageDrafts: Record<string, Canvas> = {};
        let recoveredMetadataDraft: LocalDraft<GiftMetadataDraft> | null = null;

        if (!metadataDraft || localDraftIsNewer(metadataDraft.savedAt, gift.last_edited_at)) {
            recoveredMetadataDraft = metadataDraft;
        } else {
            clearLocalDraft(key);
        }

        for (const page of editorPages) {
            const pageKey = pageDraftKey(gift.id, page.id);
            const draft = readLocalDraft<Canvas>(pageKey, {
                onError: () => errors.push(`Não foi possível recuperar o rascunho local da página "${page.name}".`),
            });

            if (!draft) {
                continue;
            }

            if (localDraftIsNewer(draft.savedAt, page.updated_at ?? gift.last_edited_at)) {
                pageDrafts[page.id] = normalizeCanvas(draft.value);

                continue;
            }

            clearLocalDraft(pageKey);
        }

        return {
            errors: [...new Set(errors)],
            metadataDraft: recoveredMetadataDraft,
            pageDrafts,
        };
    }, [editorPages, gift.id, gift.last_edited_at]);
    const recoveredMetadataDraft = localDraftRecovery.metadataDraft;
    const recoveredPageDrafts = localDraftRecovery.pageDrafts;

    const [selectedPageId, setSelectedPageId] = useState<string | null>(editorPages[0]?.id ?? null);
    const [pageDirection, setPageDirection] = useState<'next' | 'previous'>('next');
    const [activeTab, setActiveTab] = useState<EditorTab>('content');
    const [pageCanvases, setPageCanvases] = useState<Record<string, Canvas>>(() =>
        Object.fromEntries(
            editorPages.map((page) => [page.id, cloneCanvas(recoveredPageDrafts[page.id] ?? page.canvas)]),
        ),
    );
    const [savedCanvases, setSavedCanvases] = useState<Record<string, Canvas>>(() =>
        Object.fromEntries(editorPages.map((page) => [page.id, cloneCanvas(page.canvas)])),
    );
    const [pageSaveStates, setPageSaveStates] = useState<Record<string, SaveStatus>>(() =>
        Object.fromEntries(Object.keys(recoveredPageDrafts).map((pageId) => [pageId, 'dirty' as SaveStatus])),
    );
    const [pageErrors, setPageErrors] = useState<Record<string, string>>({});
    const [mediaItems, setMediaItems] = useState<EditorMediaItem[]>(media);
    const [selectedMediaId, setSelectedMediaId] = useState<string | null>(media[0]?.id ?? null);
    const [metadata, setMetadata] = useState<GiftMetadataDraft>(() =>
        metadataDraftFromLocal(recoveredMetadataDraft?.value, initialMetadata),
    );
    const [savedMetadata, setSavedMetadata] = useState<GiftMetadataDraft>(initialMetadata);
    const [metadataStatus, setMetadataStatus] = useState<SaveStatus>(recoveredMetadataDraft ? 'dirty' : 'idle');
    const [metadataErrors, setMetadataErrors] = useState<Partial<Record<keyof GiftMetadataDraft, string>>>({});
    const [assetCategories, setAssetCategories] = useState<EditorAssetCategory[]>([]);
    const [renderAssets, setRenderAssets] = useState<EditorAsset[]>(initialAssets);
    const [assets, setAssets] = useState<EditorAsset[]>(() => initialAssets.filter(isDecorativeAsset));
    const [pageBackgrounds, setPageBackgrounds] = useState<EditorAsset[]>([]);
    const [assetLibraryStatus, setAssetLibraryStatus] = useState<AssetLibraryStatus>('loading');
    const [assetLibraryError, setAssetLibraryError] = useState<string | null>(null);
    const [pageBackgroundLibraryStatus, setPageBackgroundLibraryStatus] =
        useState<PageBackgroundLibraryStatus>('loading');
    const [pageBackgroundLibraryError, setPageBackgroundLibraryError] = useState<string | null>(null);
    const [localDraftNotice, setLocalDraftNotice] = useState(
        () => Boolean(recoveredMetadataDraft) || Object.keys(recoveredPageDrafts).length > 0,
    );
    const [localDraftErrors, setLocalDraftErrors] = useState<string[]>(() => localDraftRecovery.errors);
    const editorHistory = useEditorHistory();
    const directImageInputRef = useRef<HTMLInputElement | null>(null);
    const directImageUploadTargetRef = useRef<ImageUploadTarget | null>(null);
    const mediaLibraryRef = useRef<GiftMediaLibraryHandle | null>(null);
    const metadataSaveTokenRef = useRef(0);
    const pageSaveTokensRef = useRef<Record<string, number>>({});
    const pageCanvasesRef = useRef(pageCanvases);
    const savedCanvasesRef = useRef(savedCanvases);
    const metadataRef = useRef(metadata);
    const savedMetadataRef = useRef(savedMetadata);
    const transformHistoryRef = useRef<TransformHistorySession | null>(null);
    const [directImageUploading, setDirectImageUploading] = useState(false);
    const online = useOnlineStatus();
    const canEditGift = gift.status === 'draft';

    useEffect(() => {
        pageCanvasesRef.current = pageCanvases;
    }, [pageCanvases]);

    useEffect(() => {
        savedCanvasesRef.current = savedCanvases;
    }, [savedCanvases]);

    useEffect(() => {
        metadataRef.current = metadata;
    }, [metadata]);

    useEffect(() => {
        savedMetadataRef.current = savedMetadata;
    }, [savedMetadata]);

    useEffect(() => {
        if (!debugEnabled && activeTab === 'debug') {
            setActiveTab('content');
        }
    }, [activeTab, debugEnabled]);

    const loadAssets = useCallback(async () => {
        if (!canEditGift) {
            setAssetCategories([]);
            setAssetLibraryStatus('ready');
            setAssetLibraryError(null);

            return;
        }

        setAssetLibraryStatus('loading');
        setAssetLibraryError(null);

        try {
            const response = await fetch(gift.assets_index_url, {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const payload = (await response.json().catch(() => null)) as AssetIndexResponse | null;

            if (!response.ok || !payload?.success) {
                throw new Error('Não foi possível carregar os adesivos.');
            }

            const loadedAssets = Array.isArray(payload.data.assets)
                ? payload.data.assets.filter(isDecorativeAsset)
                : [];

            setAssetCategories(Array.isArray(payload.data.categories) ? payload.data.categories : []);
            setAssets(loadedAssets);
            setRenderAssets((current) => mergeAssets(current, loadedAssets));
            setAssetLibraryStatus('ready');
        } catch (error) {
            setAssetLibraryError(error instanceof Error ? error.message : 'Não foi possível carregar os adesivos.');
            setAssetLibraryStatus('error');
        }
    }, [canEditGift, gift.assets_index_url]);

    const loadPageBackgrounds = useCallback(async () => {
        if (!canEditGift) {
            setPageBackgroundLibraryStatus('ready');
            setPageBackgroundLibraryError(null);

            return;
        }

        setPageBackgroundLibraryStatus('loading');
        setPageBackgroundLibraryError(null);

        try {
            const response = await fetch(gift.page_backgrounds_index_url, {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const payload = (await response.json().catch(() => null)) as PageBackgroundIndexResponse | null;

            if (!response.ok || !payload?.success) {
                throw new Error('Não foi possível carregar os papéis.');
            }

            const loadedBackgrounds = Array.isArray(payload.data.pageBackgrounds) ? payload.data.pageBackgrounds : [];

            setPageBackgrounds(loadedBackgrounds);
            setRenderAssets((current) => mergeAssets(current, loadedBackgrounds));
            setPageBackgroundLibraryStatus('ready');
        } catch (error) {
            setPageBackgroundLibraryError(
                error instanceof Error ? error.message : 'Não foi possível carregar os papéis.',
            );
            setPageBackgroundLibraryStatus('error');
        }
    }, [canEditGift, gift.page_backgrounds_index_url]);

    useEffect(() => {
        void loadAssets();
        void loadPageBackgrounds();
    }, [loadAssets, loadPageBackgrounds]);

    const selectedPageIndex = editorPages.findIndex((page) => page.id === selectedPageId);
    const selectedPage = selectedPageIndex >= 0 ? editorPages[selectedPageIndex] : null;
    const selectedCanvas = selectedPage ? (pageCanvases[selectedPage.id] ?? selectedPage.canvas) : null;
    const selectedPageSide = selectedPageIndex % 2 === 0 ? 'left' : 'right';
    const companionPageIndex = selectedPageSide === 'left' ? selectedPageIndex + 1 : selectedPageIndex - 1;
    const companionPage = companionPageIndex >= 0 ? (editorPages[companionPageIndex] ?? null) : null;
    const companionCanvas = companionPage ? (pageCanvases[companionPage.id] ?? companionPage.canvas) : null;
    const selection = useCanvasSelection(selectedCanvas);
    const metadataDirty = !metadataEquals(metadata, savedMetadata);
    const dirtyPageIds = useMemo(
        () =>
            editorPages
                .filter((page) => {
                    const currentCanvas = pageCanvases[page.id] ?? page.canvas;
                    const savedCanvas = savedCanvases[page.id] ?? page.canvas;

                    return !canvasesAreEqual(currentCanvas, savedCanvas);
                })
                .map((page) => page.id),
        [editorPages, pageCanvases, savedCanvases],
    );
    const dirtyPageIdSet = useMemo(() => new Set(dirtyPageIds), [dirtyPageIds]);
    const effectivePageStatuses = useMemo(
        () =>
            Object.fromEntries(
                editorPages.map((page) => {
                    const dirty = dirtyPageIdSet.has(page.id);
                    const savedState = pageSaveStates[page.id] ?? 'idle';

                    if (!online && dirty) {
                        return [page.id, 'offline' as SaveStatus];
                    }

                    if (dirty && savedState !== 'saving' && savedState !== 'error') {
                        return [page.id, 'dirty' as SaveStatus];
                    }

                    if (!dirty && savedState === 'dirty') {
                        return [page.id, 'idle' as SaveStatus];
                    }

                    return [page.id, savedState];
                }),
            ),
        [dirtyPageIdSet, editorPages, online, pageSaveStates],
    );
    const selectedPageSaveStatus = selectedPage ? (effectivePageStatuses[selectedPage.id] ?? 'idle') : 'idle';
    const selectedPageError = selectedPage ? (pageErrors[selectedPage.id] ?? null) : null;
    const textElements =
        selectedCanvas && selectedPage ? textElementsFromCanvas(selectedCanvas, selectedPage.text_max_length) : [];
    const assetMap = useMemo(() => assetMapFromList(renderAssets), [renderAssets]);
    const editorDisabled = Boolean(selectedPage?.locked || !canEditGift);
    const selectedPageHistory = editorHistory.availability(selectedPage?.id);
    const hasSaving =
        metadataStatus === 'saving' || Object.values(pageSaveStates).some((status) => status === 'saving');
    const hasError = metadataStatus === 'error' || Object.values(pageSaveStates).some((status) => status === 'error');
    const hasDirtyPages = dirtyPageIds.length > 0;
    const hasUnsavedChanges = metadataDirty || hasDirtyPages || hasSaving || hasError;
    const globalSaveStatus = globalStatus({
        hasDirty: metadataDirty || hasDirtyPages,
        hasError,
        hasSaving,
        online,
    });
    const visibleSaveError = firstVisibleError(metadataErrors, pageErrors);
    const globalSaveDetail = saveDetail(globalSaveStatus, visibleSaveError, localDraftNotice);
    const pageAutosaveSignature = useMemo(
        () => dirtyPageIds.map((pageId) => JSON.stringify(pageCanvases[pageId] ?? null)).join('|'),
        [dirtyPageIds, pageCanvases],
    );
    const metadataAutosaveSignature = useMemo(() => JSON.stringify(metadata), [metadata]);

    useUnsavedChangesWarning(hasUnsavedChanges);

    const saveMetadataDraft = useCallback(async () => {
        if (!canEditGift || !online) {
            return;
        }

        const snapshot = metadataRef.current;

        if (metadataEquals(snapshot, savedMetadataRef.current)) {
            return;
        }

        const saveToken = metadataSaveTokenRef.current + 1;
        metadataSaveTokenRef.current = saveToken;
        setMetadataStatus('saving');
        setMetadataErrors({});
        debugAutosave('metadata-save-started');

        try {
            const response = await patchJson<AutosaveResponse<MetadataSaveData>>(gift.update_url, snapshot);

            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            const savedDraft = metadataFromResponse(response.data.gift, snapshot);
            const currentDraft = metadataRef.current;
            const latestMatchesSnapshot = metadataEquals(currentDraft, snapshot);
            setSavedMetadata(savedDraft);
            savedMetadataRef.current = savedDraft;

            if (latestMatchesSnapshot) {
                setMetadata(savedDraft);
                metadataRef.current = savedDraft;
                clearLocalDraft(metadataDraftKey(gift.id));
            }

            setMetadataStatus(latestMatchesSnapshot ? 'saved' : 'dirty');
            debugAutosave('metadata-save-succeeded', { hasNewerChanges: !latestMatchesSnapshot });
        } catch (error) {
            if (metadataSaveTokenRef.current !== saveToken) {
                return;
            }

            setMetadataErrors(metadataErrorsFrom(error));
            setMetadataStatus(navigator.onLine ? 'error' : 'offline');
            debugAutosave('metadata-save-failed', { message: errorMessageFrom(error, 'Erro ao salvar metadados.') });
        }
    }, [canEditGift, gift.id, gift.update_url, online]);

    const savePageById = useCallback(
        async (pageId: string) => {
            const page = editorPageById.get(pageId);

            if (!page || page.locked || !canEditGift || !online) {
                return;
            }

            const currentCanvas = pageCanvasesRef.current[pageId] ?? page.canvas;
            const savedCanvas = savedCanvasesRef.current[pageId] ?? page.canvas;

            if (canvasesAreEqual(currentCanvas, savedCanvas)) {
                return;
            }

            const snapshot = cloneCanvas(currentCanvas);
            const saveToken = (pageSaveTokensRef.current[pageId] ?? 0) + 1;
            pageSaveTokensRef.current[pageId] = saveToken;
            setPageSaveStates((current) => ({ ...current, [pageId]: 'saving' }));
            setPageErrors((current) => withoutKey(current, pageId));
            debugAutosave('page-save-started', { pageId });

            try {
                const response = await patchJson<AutosaveResponse<PageSaveData>>(page.update_url, { canvas: snapshot });
                const savedCanvasFromServer = normalizeCanvas(response.data.page.canvas);

                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                if (!pageBackgroundsAreEqual(snapshot.artboard.background, savedCanvasFromServer.artboard.background)) {
                    setPageErrors((current) => ({
                        ...current,
                        [pageId]:
                            'O servidor não confirmou o papel escolhido. A alteração local foi mantida para tentar salvar novamente.',
                    }));
                    setPageSaveStates((current) => ({ ...current, [pageId]: 'error' }));
                    debugAutosave('page-save-background-mismatch', { pageId });

                    return;
                }

                const latestCanvas = pageCanvasesRef.current[pageId] ?? snapshot;
                const latestMatchesSnapshot = canvasesAreEqual(latestCanvas, snapshot);
                setSavedCanvases((current) => ({ ...current, [pageId]: cloneCanvas(savedCanvasFromServer) }));
                savedCanvasesRef.current = {
                    ...savedCanvasesRef.current,
                    [pageId]: cloneCanvas(savedCanvasFromServer),
                };

                if (latestMatchesSnapshot) {
                    setPageCanvases((current) => ({ ...current, [pageId]: cloneCanvas(savedCanvasFromServer) }));
                    pageCanvasesRef.current = {
                        ...pageCanvasesRef.current,
                        [pageId]: cloneCanvas(savedCanvasFromServer),
                    };
                    clearLocalDraft(pageDraftKey(gift.id, pageId));
                }

                setPageSaveStates((current) => ({ ...current, [pageId]: latestMatchesSnapshot ? 'saved' : 'dirty' }));
                debugAutosave('page-save-succeeded', { hasNewerChanges: !latestMatchesSnapshot, pageId });
            } catch (error) {
                if (pageSaveTokensRef.current[pageId] !== saveToken) {
                    return;
                }

                setPageErrors((current) => ({
                    ...current,
                    [pageId]: errorMessageFrom(error, 'Não foi possível salvar esta página.'),
                }));
                setPageSaveStates((current) => ({ ...current, [pageId]: navigator.onLine ? 'error' : 'offline' }));
                debugAutosave('page-save-failed', {
                    message: errorMessageFrom(error, 'Não foi possível salvar esta página.'),
                    pageId,
                });
            }
        },
        [canEditGift, editorPageById, gift.id, online],
    );

    const autosaveMetadata = useCallback(() => {
        void metadataAutosaveSignature;
        void saveMetadataDraft();
    }, [metadataAutosaveSignature, saveMetadataDraft]);

    const autosavePages = useCallback(() => {
        void pageAutosaveSignature;
        dirtyPageIds.forEach((pageId) => {
            void savePageById(pageId);
        });
    }, [dirtyPageIds, pageAutosaveSignature, savePageById]);

    useAutosave({
        enabled: canEditGift && online && metadataDirty,
        label: 'metadata',
        onSave: autosaveMetadata,
    });
    useAutosave({
        enabled: canEditGift && online && dirtyPageIds.length > 0,
        label: 'pages',
        onSave: autosavePages,
    });

    function selectPage(pageId: string) {
        const nextPageIndex = editorPages.findIndex((page) => page.id === pageId);

        editorHistory.flushPending(selectedPageId);
        setPageDirection(nextPageIndex < selectedPageIndex ? 'previous' : 'next');
        setSelectedPageId(pageId);
        selection.clearSelection();
    }

    function goToPage(offset: number) {
        const nextPage = editorPages[selectedPageIndex + offset];

        if (nextPage) {
            selectPage(nextPage.id);
        }
    }

    function changeText(element: EditableTextElement, value: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const targetElement = canvas.elements.find((item) => item.id === element.id);

                if (!canModifyElement(targetElement)) {
                    return canvas;
                }

                return updateCanvasText(canvas, element.id, element.field, value);
            },
            {
                groupKey: `text:${element.id}:${element.field}`,
                history: 'debounce',
                label: 'Editar texto',
            },
        );
    }

    function addUploadedMedia(mediaItem: EditorMediaItem, target: ImageUploadTarget | null) {
        setMediaItems((current) => [mediaItem, ...current.filter((item) => item.id !== mediaItem.id)]);
        setSelectedMediaId(mediaItem.id);

        if (!target) {
            return;
        }

        applyMediaToPage(target.pageId, target.elementId, mediaItem);

        if (target.pageId === selectedPageId) {
            selection.selectElement(target.elementId);
        }
    }

    function changeElementFromStage(elementId: string, nextElement: CanvasElement) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        updatePageCanvas(
            selectedPage.id,
            (canvas) => ({
                ...canvas,
                elements: canvas.elements.map((element) => (element.id === elementId ? nextElement : element)),
            }),
            { history: 'skip' },
        );
    }

    function patchSelectedElement(patch: ElementPatch) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const targetElement = canvas.elements.find((element) => element.id === elementId);

                if (!canModifyElement(targetElement)) {
                    return canvas;
                }

                const nextCanvas = patchCanvasElement(canvas, elementId, patch);

                return patch.z === undefined ? nextCanvas : normalizeCanvasLayerOrder(nextCanvas);
            },
            {
                groupKey: `element:${elementId}:properties`,
                history: 'debounce',
                label: patch.z === undefined ? 'Editar elemento' : 'Alterar camada',
            },
        );
    }

    function patchSelectedElementStyle(stylePatch: Record<string, unknown>) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const targetElement = canvas.elements.find((element) => element.id === elementId);

                if (!canModifyElement(targetElement)) {
                    return canvas;
                }

                return patchElementStyle(canvas, elementId, stylePatch);
            },
            {
                groupKey: `element:${elementId}:style`,
                history: 'debounce',
                label: 'Editar estilo',
            },
        );
    }

    function changeSelectedElementText(element: CanvasElement, value: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        if (!canModifyElement(element)) {
            return;
        }

        const field = textFieldForElement(element);

        updatePageCanvas(selectedPage.id, (canvas) => updateCanvasText(canvas, element.id, field, value), {
            groupKey: `text:${element.id}:${field}`,
            history: 'debounce',
            label: 'Editar texto',
        });
    }

    function changeSelectedElementLayer(action: LayerAction) {
        if (!selectedPage || !selection.selectedElement || editorDisabled) {
            return;
        }

        const elementId = selection.selectedElement.id;

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const targetElement = canvas.elements.find((element) => element.id === elementId);

                if (!canModifyElement(targetElement)) {
                    return canvas;
                }

                return applyLayerAction(canvas, elementId, action);
            },
            { label: 'Alterar camada' },
        );
    }

    function duplicateCanvasElement(elementId: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const targetElement = selectedCanvas?.elements.find((element) => element.id === elementId);

        if (!targetElement || isElementLocked(targetElement) || isElementHidden(targetElement)) {
            return;
        }

        let duplicatedElementId: string | null = null;

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const result = duplicateElement(canvas, elementId);
                duplicatedElementId = result.duplicatedElementId;

                return result.canvas;
            },
            {
                label: 'Duplicar elemento',
            },
        );

        if (duplicatedElementId) {
            selection.selectElement(duplicatedElementId);
        }
    }

    function deleteCanvasElement(elementId: string, confirmDelete = true) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const targetElement = selectedCanvas?.elements.find((element) => element.id === elementId);

        if (!targetElement || isElementLocked(targetElement)) {
            return;
        }

        if (confirmDelete && !window.confirm('Excluir este item da página?')) {
            return;
        }

        let nextSelectedElementId: string | null = null;

        updatePageCanvas(
            selectedPage.id,
            (canvas) => {
                const result = deleteElement(canvas, elementId);
                nextSelectedElementId = result.nextSelectedElementId;

                return result.canvas;
            },
            {
                label: 'Excluir item',
            },
        );

        if (nextSelectedElementId) {
            selection.selectElement(nextSelectedElementId);
        } else {
            selection.clearSelection();
        }
    }

    function toggleElementLocked(elementId: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const targetElement = selectedCanvas?.elements.find((element) => element.id === elementId);

        updatePageCanvas(selectedPage.id, (canvas) => toggleLocked(canvas, elementId), {
            label: isElementLocked(targetElement) ? 'Desbloquear elemento' : 'Bloquear elemento',
        });
        selection.selectElement(elementId);
    }

    function toggleElementHidden(elementId: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const targetElement = selectedCanvas?.elements.find((element) => element.id === elementId);

        updatePageCanvas(selectedPage.id, (canvas) => toggleHidden(canvas, elementId), {
            label: isElementHidden(targetElement) ? 'Exibir elemento' : 'Ocultar elemento',
        });
        selection.selectElement(elementId);
    }

    function renameCanvasElement(elementId: string, name: string) {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const currentName = selectedCanvas?.elements.find((element) => element.id === elementId)?.name;

        if ((typeof currentName === 'string' ? currentName.trim() : '') === name.trim()) {
            return;
        }

        updatePageCanvas(selectedPage.id, (canvas) => renameElement(canvas, elementId, name), {
            label: 'Renomear camada',
        });
    }

    function selectElementFromCanvas(elementId: string) {
        selection.selectElement(elementId);
    }

    function openImageUpload(element: CanvasElement) {
        if (
            !selectedPage ||
            editorDisabled ||
            directImageUploading ||
            (element.type !== 'image' && element.type !== 'flip_polaroid')
        ) {
            return;
        }

        if (!canModifyElement(element)) {
            return;
        }

        selection.selectElement(element.id);
        directImageUploadTargetRef.current = { pageId: selectedPage.id, elementId: element.id };
        directImageInputRef.current?.click();
    }

    async function uploadDirectImage(file: File | null) {
        const target = directImageUploadTargetRef.current;

        if (!file || !target || editorDisabled) {
            directImageUploadTargetRef.current = null;

            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setDirectImageUploading(true);
        setPageErrors((current) => withoutKey(current, target.pageId));

        try {
            const response = await fetch(gift.media_store_url, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const payload = (await response.json().catch(() => ({}))) as ImageUploadResponse;

            if (!response.ok || !payload.data) {
                throw new Error(uploadErrorMessage(payload));
            }

            addUploadedMedia(payload.data, target);
        } catch (error) {
            setPageErrors((current) => ({
                ...current,
                [target.pageId]: error instanceof Error ? error.message : 'Não foi possível enviar a imagem.',
            }));
            setPageSaveStates((current) => ({ ...current, [target.pageId]: navigator.onLine ? 'error' : 'offline' }));
        } finally {
            directImageUploadTargetRef.current = null;
            setDirectImageUploading(false);

            if (directImageInputRef.current) {
                directImageInputRef.current.value = '';
            }
        }
    }

    function addAssetToCurrentPage(asset: EditorAsset) {
        if (!selectedPage || !selectedCanvas || editorDisabled) {
            return;
        }

        const elementId = generatedStickerId(asset);
        const size = defaultAssetSize(asset, selectedCanvas);
        const nextElement: CanvasElement = {
            id: elementId,
            type: 'sticker',
            assetId: asset.id,
            x: Math.max(0, Math.round((selectedCanvas.artboard.width - size.w) / 2)),
            y: Math.max(0, Math.round((selectedCanvas.artboard.height - size.h) / 2)),
            w: size.w,
            h: size.h,
            rotation: defaultAssetRotation(asset),
            z: Math.max(0, ...selectedCanvas.elements.map((element) => element.z)) + 10,
            locked: false,
            hidden: false,
        };

        updatePageCanvas(
            selectedPage.id,
            (canvas) =>
                normalizeCanvasLayerOrder({
                    ...canvas,
                    elements: [...canvas.elements, nextElement],
                }),
            {
                label: 'Adicionar adesivo',
            },
        );
        selection.selectElement(elementId);
    }

    function addInteractiveElementToCurrentPage(kind: InteractiveElementKind) {
        if (!selectedPage || !selectedCanvas || editorDisabled) {
            return;
        }

        const nextElement = defaultInteractiveElement(kind, selectedCanvas);

        updatePageCanvas(
            selectedPage.id,
            (canvas) =>
                normalizeCanvasLayerOrder({
                    ...canvas,
                    elements: [...canvas.elements, nextElement],
                }),
            {
                label: kind === 'interactive_envelope' ? 'Adicionar envelope' : 'Adicionar polaroid',
            },
        );
        selection.selectElement(nextElement.id);
    }

    function applyPageBackgroundToCurrentPage(asset: EditorAsset) {
        if (!selectedPage || !selectedCanvas || editorDisabled) {
            return;
        }

        setRenderAssets((current) => mergeAssets(current, [asset]));
        selection.clearSelection();
        updatePageCanvas(
            selectedPage.id,
            (canvas) => ({
                ...canvas,
                artboard: {
                    ...canvas.artboard,
                    background: {
                        type: 'asset',
                        assetId: asset.id,
                        fit: 'cover',
                        opacity: 1,
                    },
                },
            }),
            {
                label: 'Trocar papel da página',
            },
        );
    }

    function useThemePageBackground() {
        if (!selectedPage || !selectedCanvas || editorDisabled) {
            return;
        }

        selection.clearSelection();
        updatePageCanvas(
            selectedPage.id,
            (canvas) => ({
                ...canvas,
                artboard: {
                    ...canvas.artboard,
                    background: { type: 'theme' },
                },
            }),
            {
                label: 'Usar papel do tema',
            },
        );
    }

    function changeMetadata(field: keyof GiftMetadataDraft, value: string) {
        if (!canEditGift) {
            return;
        }

        setMetadata((current) => {
            const next = { ...current, [field]: value };
            writeLocalDraft(metadataDraftKey(gift.id), next);

            return next;
        });
        setMetadataErrors({});
        setMetadataStatus('dirty');
    }

    function applyMediaToPage(pageId: string, elementId: string, mediaItem: EditorMediaItem) {
        updatePageCanvas(
            pageId,
            (canvas) => {
                const targetElement = canvas.elements.find((element) => element.id === elementId);

                if (!canModifyElement(targetElement)) {
                    return canvas;
                }

                return applyMediaToPhotoElement(canvas, elementId, mediaItem);
            },
            {
                label: 'Trocar imagem',
            },
        );
    }

    function recordCanvasHistory(pageId: string, before: Canvas, after: Canvas, options: UpdatePageCanvasOptions) {
        const historyMode = options.history ?? 'push';

        if (historyMode === 'skip') {
            return;
        }

        const label = options.label ?? 'Editar página';

        if (historyMode === 'debounce') {
            editorHistory.pushDebounced(pageId, options.groupKey ?? label, before, after, label);

            return;
        }

        editorHistory.push(pageId, before, after, label);
    }

    function updatePageCanvas(
        pageId: string,
        updater: (canvas: Canvas) => Canvas,
        options: UpdatePageCanvasOptions = {},
    ) {
        const page = editorPageById.get(pageId);

        if (!page || page.locked || !canEditGift) {
            return;
        }

        const baseCanvas = pageCanvasesRef.current[pageId] ?? page.canvas;
        const nextCanvas = updater(baseCanvas);

        if (canvasesAreEqual(baseCanvas, nextCanvas)) {
            return;
        }

        recordCanvasHistory(pageId, baseCanvas, nextCanvas, options);
        protectPageDraft(pageId, page, nextCanvas);
        pageCanvasesRef.current = {
            ...pageCanvasesRef.current,
            [pageId]: nextCanvas,
        };
        setPageCanvases(pageCanvasesRef.current);
        setPageErrors((current) => withoutKey(current, pageId));
        setPageSaveStates((current) => ({ ...current, [pageId]: 'dirty' }));
    }

    function applyHistoryCanvas(pageId: string, canvas: Canvas) {
        const page = editorPageById.get(pageId);

        if (!page || page.locked || !canEditGift) {
            return;
        }

        const nextCanvas = cloneCanvas(canvas);
        protectPageDraft(pageId, page, nextCanvas);
        pageCanvasesRef.current = {
            ...pageCanvasesRef.current,
            [pageId]: nextCanvas,
        };
        setPageCanvases(pageCanvasesRef.current);
        setPageErrors((current) => withoutKey(current, pageId));
        setPageSaveStates((current) => ({ ...current, [pageId]: 'dirty' }));

        if (
            pageId === selectedPageId &&
            selection.selectedElementId &&
            !nextCanvas.elements.some((element) => element.id === selection.selectedElementId)
        ) {
            selection.clearSelection();
        }
    }

    function protectPageDraft(pageId: string, page: EditorPage, canvas: Canvas) {
        const savedCanvas = savedCanvasesRef.current[pageId] ?? page.canvas;
        const key = pageDraftKey(gift.id, pageId);

        if (canvasesAreEqual(canvas, savedCanvas)) {
            clearLocalDraft(key);

            return;
        }

        writeLocalDraft(key, canvas);
    }

    function undoCurrentPage() {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const result = editorHistory.undo(selectedPage.id);

        if (result.canvas) {
            applyHistoryCanvas(selectedPage.id, result.canvas);
        }
    }

    function redoCurrentPage() {
        if (!selectedPage || editorDisabled) {
            return;
        }

        const result = editorHistory.redo(selectedPage.id);

        if (result.canvas) {
            applyHistoryCanvas(selectedPage.id, result.canvas);
        }
    }

    function beginElementTransform(elementId: string, mode: TransformMode) {
        if (!selectedPage || !selectedCanvas || editorDisabled) {
            return;
        }

        transformHistoryRef.current = {
            before: cloneCanvas(pageCanvasesRef.current[selectedPage.id] ?? selectedCanvas),
            elementId,
            mode,
            pageId: selectedPage.id,
        };
    }

    function endElementTransform(elementId: string, mode: TransformMode) {
        const session = transformHistoryRef.current;
        transformHistoryRef.current = null;

        if (!session || session.elementId !== elementId || session.mode !== mode) {
            return;
        }

        const after = pageCanvasesRef.current[session.pageId];

        if (!after) {
            return;
        }

        editorHistory.push(session.pageId, session.before, after, transformHistoryLabel(mode));
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (isEditableKeyboardTarget(event.target)) {
                return;
            }

            const key = event.key.toLowerCase();
            const modifierPressed = event.metaKey || event.ctrlKey;

            if (modifierPressed && key === 'z' && !event.repeat && !editorDisabled) {
                event.preventDefault();

                if (event.shiftKey) {
                    redoCurrentPage();
                } else {
                    undoCurrentPage();
                }

                return;
            }

            if (modifierPressed && key === 'y' && !event.repeat && !editorDisabled) {
                event.preventDefault();
                redoCurrentPage();

                return;
            }

            if (!selection.selectedElement || editorDisabled) {
                return;
            }

            const selectedElement = selection.selectedElement;

            if (event.key === 'Escape') {
                event.preventDefault();
                selection.clearSelection();

                return;
            }

            if ((event.key === 'Delete' || event.key === 'Backspace') && !event.repeat) {
                event.preventDefault();
                deleteCanvasElement(selectedElement.id, true);

                return;
            }

            if (isElementLocked(selectedElement) || isElementHidden(selectedElement)) {
                return;
            }

            if (modifierPressed && key === 'd' && !event.repeat) {
                event.preventDefault();
                duplicateCanvasElement(selectedElement.id);

                return;
            }

            const step = event.shiftKey ? 24 : 8;

            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                patchSelectedElement({ x: selectedElement.x - step });
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                patchSelectedElement({ x: selectedElement.x + step });
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                patchSelectedElement({ y: selectedElement.y - step });
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                patchSelectedElement({ y: selectedElement.y + step });
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <>
            <Head title={`Editar ${metadata.title}`} />
            <main className="gift-editor-root relative min-h-dvh overflow-x-clip text-[#342E38]">
                <div className="relative z-10">
                    <GiftEditorTopBar
                        activeTab={activeTab}
                        canRedo={selectedPageHistory.canRedo}
                        canUndo={selectedPageHistory.canUndo}
                        dashboardUrl={gift.dashboard_url}
                        historyDisabled={editorDisabled}
                        onChangeTab={setActiveTab}
                        onRedo={redoCurrentPage}
                        onUndo={undoCurrentPage}
                        orderUrl={gift.order_url}
                        previewUrl={gift.preview_url}
                        reviewUrl={gift.review_url}
                        saveDetail={globalSaveDetail}
                        saveStatus={globalSaveStatus}
                        shareUrl={gift.share_url}
                        status={gift.status}
                        title={metadata.title}
                    />
                    <input
                        ref={directImageInputRef}
                        accept="image/jpeg,image/png,image/webp"
                        aria-label="Enviar imagem para o item selecionado"
                        className="sr-only"
                        disabled={editorDisabled || directImageUploading}
                        onChange={(event) => {
                            void uploadDirectImage(event.target.files?.[0] ?? null);
                        }}
                        type="file"
                    />

                    <GiftEditorLayout
                        left={
                            <GiftPageSidebar
                                assets={assetMap}
                                onSelectPage={selectPage}
                                pageStatuses={effectivePageStatuses}
                                pageCanvases={pageCanvases}
                                pages={editorPages}
                                selectedPageId={selectedPageId}
                                theme={gift.theme?.config}
                            />
                        }
                        center={
                            <div className="grid gap-3">
                                {localDraftNotice ? (
                                    <LocalDraftNotice onDismiss={() => setLocalDraftNotice(false)} />
                                ) : null}
                                {localDraftErrors.length > 0 ? (
                                    <LocalDraftErrorNotice
                                        errors={localDraftErrors}
                                        onDismiss={() => setLocalDraftErrors([])}
                                    />
                                ) : null}
                                {globalSaveStatus === 'error' && visibleSaveError ? (
                                    <EditorAlert
                                        message={visibleSaveError}
                                        title="Não foi possível salvar tudo agora"
                                    />
                                ) : null}
                                <GiftPagePreview
                                    activeSide={selectedPageSide}
                                    assets={assetMap}
                                    canGoNext={selectedPageIndex < editorPages.length - 1}
                                    canGoPrevious={selectedPageIndex > 0}
                                    canvas={selectedCanvas}
                                    companionCanvas={companionCanvas}
                                    companionPage={companionPage}
                                    companionPageNumber={companionPageIndex + 1}
                                    direction={pageDirection}
                                    disabled={editorDisabled}
                                    imageReplacing={directImageUploading}
                                    maxTextLength={selectedPage?.text_max_length ?? 1000}
                                    onChangeElement={changeElementFromStage}
                                    onChangeText={changeSelectedElementText}
                                    onClearSelection={selection.clearSelection}
                                    onNext={() => goToPage(1)}
                                    onPrevious={() => goToPage(-1)}
                                    onReplaceImage={openImageUpload}
                                    onSelectCompanion={companionPage ? () => selectPage(companionPage.id) : undefined}
                                    onSelectElement={selectElementFromCanvas}
                                    onTransformEnd={endElementTransform}
                                    onTransformStart={beginElementTransform}
                                    page={selectedPage}
                                    pageNumber={selectedPageIndex + 1}
                                    selectedElementId={selection.selectedElementId}
                                    theme={gift.theme?.config}
                                />
                            </div>
                        }
                        right={
                            <div className="gift-editor-toolbook">
                                <div className="gift-editor-toolbook-heading">
                                    <div>
                                        <p className="font-display text-lg font-bold text-[#FBFAF6]">
                                            Oficina da página
                                        </p>
                                        <p className="mt-0.5 truncate text-xs font-medium text-[#C9C1CD]">
                                            {selectedPage?.name ?? 'Nenhuma página selecionada'}
                                        </p>
                                    </div>
                                    <span className="gift-editor-toolbook-page">
                                        {String(selectedPageIndex + 1).padStart(2, '0')}
                                    </span>
                                </div>
                                <EditorTabs activeTab={activeTab} onChange={setActiveTab} showDebug={debugEnabled} />
                                <div
                                    aria-labelledby={`editor-tab-${activeTab}`}
                                    className="gift-editor-tool-panel"
                                    id="editor-active-panel"
                                    role="tabpanel"
                                >
                                    {selection.selectedElement ? (
                                        <ElementPropertiesPanel
                                            disabled={editorDisabled}
                                            element={selection.selectedElement}
                                            maxTextLength={selectedPage?.text_max_length ?? 1000}
                                            onChangeText={changeSelectedElementText}
                                            onLayerAction={changeSelectedElementLayer}
                                            onPatchElement={patchSelectedElement}
                                            onPatchStyle={patchSelectedElementStyle}
                                            onReplacePhoto={openImageUpload}
                                        />
                                    ) : null}
                                    {activeTab === 'content' ? (
                                        <GiftContentPanel
                                            disabled={editorDisabled}
                                            elements={textElements}
                                            error={selectedPageError}
                                            onChangeText={changeText}
                                            saveStatus={selectedPageSaveStatus}
                                        />
                                    ) : null}
                                    {activeTab === 'images' ? (
                                        <GiftImagesPanel
                                            disabled={editorDisabled}
                                            mediaItems={mediaItems}
                                            mediaLibraryRef={mediaLibraryRef}
                                            onSelectMedia={setSelectedMediaId}
                                            onUploaded={addUploadedMedia}
                                            selectedMediaId={selectedMediaId}
                                            uploadUrl={gift.media_store_url}
                                        />
                                    ) : null}
                                    {activeTab === 'stickers' ? (
                                        <GiftAssetsPanel
                                            assets={assets}
                                            categories={assetCategories}
                                            disabled={editorDisabled || !selectedPage || !selectedCanvas}
                                            error={assetLibraryError}
                                            onAddAsset={addAssetToCurrentPage}
                                            onRetry={loadAssets}
                                            saveStatus={selectedPageSaveStatus}
                                            status={assetLibraryStatus}
                                            theme={gift.theme?.config}
                                        />
                                    ) : null}
                                    {activeTab === 'interactive' ? (
                                        <GiftInteractiveElementsPanel
                                            disabled={editorDisabled || !selectedPage || !selectedCanvas}
                                            onAddElement={addInteractiveElementToCurrentPage}
                                            saveStatus={selectedPageSaveStatus}
                                        />
                                    ) : null}
                                    {activeTab === 'page' ? (
                                        <GiftPageBackgroundPanel
                                            backgrounds={pageBackgrounds}
                                            canvas={selectedCanvas}
                                            disabled={editorDisabled || !selectedPage || !selectedCanvas}
                                            error={pageBackgroundLibraryError}
                                            onApplyAsset={applyPageBackgroundToCurrentPage}
                                            onRetry={loadPageBackgrounds}
                                            onUseTheme={useThemePageBackground}
                                            saveStatus={selectedPageSaveStatus}
                                            status={pageBackgroundLibraryStatus}
                                            theme={gift.theme?.config}
                                        />
                                    ) : null}
                                    {activeTab === 'gift' ? (
                                        <GiftMetadataPanel
                                            disabled={!canEditGift}
                                            errors={metadataErrors}
                                            metadata={metadata}
                                            onChange={changeMetadata}
                                        />
                                    ) : null}
                                    {activeTab === 'layers' ? (
                                        <GiftLayersPanel
                                            assets={assetMap}
                                            canvas={selectedCanvas}
                                            disabled={editorDisabled}
                                            onDeleteElement={deleteCanvasElement}
                                            onDuplicateElement={duplicateCanvasElement}
                                            onLayerAction={changeSelectedElementLayer}
                                            onRenameElement={renameCanvasElement}
                                            onSelectElement={selectElementFromCanvas}
                                            onToggleHidden={toggleElementHidden}
                                            onToggleLocked={toggleElementLocked}
                                            selectedElementId={selection.selectedElementId}
                                        />
                                    ) : null}
                                    {activeTab === 'debug' && debugEnabled ? (
                                        <GiftDebugPanel canvas={selectedCanvas} pageId={selectedPageId} />
                                    ) : null}
                                </div>
                            </div>
                        }
                    />
                </div>
            </main>
        </>
    );
}

type LocalDraftNoticeProps = {
    onDismiss: () => void;
};

function LocalDraftNotice({ onDismiss }: LocalDraftNoticeProps) {
    return (
        <div className="editor-notice editor-notice--recovered flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <span className="font-semibold">
                Rascunho local recuperado. Ele será sincronizado automaticamente quando o salvamento terminar.
            </span>
            <button className="editor-notice-action" onClick={onDismiss} type="button">
                Entendi
            </button>
        </div>
    );
}

type LocalDraftErrorNoticeProps = {
    errors: string[];
    onDismiss: () => void;
};

function LocalDraftErrorNotice({ errors, onDismiss }: LocalDraftErrorNoticeProps) {
    return (
        <div className="editor-notice editor-notice--error grid gap-3 px-4 py-3 text-sm" role="alert">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <p className="font-semibold">Algum rascunho local não pôde ser recuperado.</p>
                    {errors.map((error) => (
                        <p className="text-xs font-medium" key={error}>
                            {error}
                        </p>
                    ))}
                </div>
                <button className="editor-notice-action" onClick={onDismiss} type="button">
                    Fechar
                </button>
            </div>
        </div>
    );
}

type EditorAlertProps = {
    message: string;
    title: string;
};

function EditorAlert({ message, title }: EditorAlertProps) {
    return (
        <div className="editor-notice editor-notice--error px-4 py-3 text-sm" role="alert">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 font-medium">{message}</p>
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

function metadataDraftFromLocal(value: GiftMetadataDraft | undefined, fallback: GiftMetadataDraft): GiftMetadataDraft {
    if (!value || typeof value.title !== 'string') {
        return fallback;
    }

    return {
        title: value.title,
        recipient_name: typeof value.recipient_name === 'string' ? value.recipient_name : fallback.recipient_name,
        sender_name: typeof value.sender_name === 'string' ? value.sender_name : fallback.sender_name,
    };
}

function metadataFromResponse(value: MetadataSaveData['gift'], fallback: GiftMetadataDraft): GiftMetadataDraft {
    return {
        title: value.title ?? fallback.title,
        recipient_name: value.recipient_name ?? '',
        sender_name: value.sender_name ?? '',
    };
}

function metadataEquals(left: GiftMetadataDraft, right: GiftMetadataDraft): boolean {
    return (
        left.title === right.title &&
        left.recipient_name === right.recipient_name &&
        left.sender_name === right.sender_name
    );
}

function metadataErrorsFrom(error: unknown): Partial<Record<keyof GiftMetadataDraft, string>> {
    if (!(error instanceof AutosaveRequestError)) {
        return {};
    }

    return {
        title: firstString(error.errors.title),
        recipient_name: firstString(error.errors.recipient_name),
        sender_name: firstString(error.errors.sender_name),
    };
}

function errorMessageFrom(error: unknown, fallback: string): string {
    if (error instanceof AutosaveRequestError) {
        return firstAutosaveError(error.errors) ?? error.message ?? fallback;
    }

    return fallback;
}

function firstString(value: string[] | string | undefined): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    return value?.find((message) => typeof message === 'string' && message !== '');
}

function withoutKey<TValue>(record: Record<string, TValue>, key: string): Record<string, TValue> {
    const next = { ...record };
    delete next[key];

    return next;
}

function metadataDraftKey(giftId: string): string {
    return `scrapbook:gifts:${giftId}:metadata`;
}

function pageDraftKey(giftId: string, pageId: string): string {
    return `scrapbook:gifts:${giftId}:pages:${pageId}:canvas`;
}

function localDraftIsNewer(localSavedAt: string, serverSavedAt: string | null): boolean {
    const localTime = Date.parse(localSavedAt);

    if (!Number.isFinite(localTime)) {
        return false;
    }

    if (!serverSavedAt) {
        return true;
    }

    const serverTime = Date.parse(serverSavedAt);

    if (!Number.isFinite(serverTime)) {
        return true;
    }

    return localTime > serverTime;
}

function globalStatus({
    hasDirty,
    hasError,
    hasSaving,
    online,
}: {
    hasDirty: boolean;
    hasError: boolean;
    hasSaving: boolean;
    online: boolean;
}): SaveStatus {
    if (!online) {
        return 'offline';
    }

    if (hasSaving) {
        return 'saving';
    }

    if (hasError) {
        return 'error';
    }

    if (hasDirty) {
        return 'dirty';
    }

    return 'saved';
}

function saveDetail(status: SaveStatus, visibleError: string | null, hasRecoveredLocalDraft: boolean): string | null {
    if (status === 'error') {
        return visibleError;
    }

    if (status === 'dirty') {
        return 'Autosave em instantes';
    }

    if (status === 'offline') {
        return hasRecoveredLocalDraft ? 'Rascunho local recuperado' : 'Rascunho local protegido';
    }

    return null;
}

function pageBackgroundsAreEqual(
    left: Canvas['artboard']['background'] | undefined,
    right: Canvas['artboard']['background'] | undefined,
): boolean {
    const normalizedLeft = left ?? { type: 'theme' };
    const normalizedRight = right ?? { type: 'theme' };

    if (normalizedLeft.type !== normalizedRight.type) {
        return false;
    }

    if (normalizedLeft.type === 'theme') {
        return true;
    }

    if (normalizedRight.type !== 'asset') {
        return false;
    }

    return (
        String(normalizedLeft.assetId) === String(normalizedRight.assetId) &&
        (normalizedLeft.fit ?? 'cover') === (normalizedRight.fit ?? 'cover') &&
        backgroundOpacity(normalizedLeft.opacity) === backgroundOpacity(normalizedRight.opacity)
    );
}

function backgroundOpacity(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}

function transformHistoryLabel(mode: TransformMode): string {
    if (mode === 'move') {
        return 'Mover elemento';
    }

    if (mode === 'rotate') {
        return 'Rotacionar elemento';
    }

    return 'Redimensionar elemento';
}

function firstVisibleError(
    metadataErrors: Partial<Record<keyof GiftMetadataDraft, string>>,
    pageErrors: Record<string, string>,
): string | null {
    return Object.values(metadataErrors).find(Boolean) ?? Object.values(pageErrors).find(Boolean) ?? null;
}

function uploadErrorMessage(payload: ImageUploadResponse): string {
    const firstError = payload.errors
        ? Object.values(payload.errors)
              .flat()
              .find((message): message is string => typeof message === 'string' && message !== '')
        : null;

    return firstError ?? payload.message ?? 'Não foi possível enviar a imagem.';
}

function csrfToken(): string {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function generatedStickerId(asset: EditorAsset): string {
    const suffix =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return `sticker_${String(asset.id).replace(/[^a-z0-9_-]/gi, '_')}_${suffix}`;
}

function generatedInteractiveElementId(kind: InteractiveElementKind): string {
    const suffix =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return `${kind}_${suffix}`;
}

function defaultInteractiveElement(kind: InteractiveElementKind, canvas: Canvas): CanvasElement {
    const z = Math.max(0, ...canvas.elements.map((element) => element.z)) + 10;

    if (kind === 'flip_polaroid') {
        const w = 390;
        const h = 510;

        return {
            id: generatedInteractiveElementId(kind),
            type: 'flip_polaroid',
            name: 'Polaroid virável',
            x: Math.max(0, Math.round((canvas.artboard.width - w) / 2)),
            y: Math.max(0, Math.round((canvas.artboard.height - h) / 2)),
            w,
            h,
            rotation: -3,
            z,
            locked: false,
            hidden: false,
            front: {
                mediaItemId: null,
                placeholderLabel: 'Sua foto aqui',
                caption: 'Nosso momento',
            },
            back: {
                text: 'Eu amo essa lembrança.',
            },
        };
    }

    const w = 700;
    const h = 420;

    return {
        id: generatedInteractiveElementId(kind),
        type: 'interactive_envelope',
        name: 'Envelope com carta',
        x: Math.max(0, Math.round((canvas.artboard.width - w) / 2)),
        y: Math.max(0, Math.round((canvas.artboard.height - h) / 2)),
        w,
        h,
        rotation: -2,
        z,
        locked: false,
        hidden: false,
        title: 'Abra quando sentir saudade',
        content: 'Escrevi essa cartinha só para você...',
        state: {
            defaultOpen: false,
        },
        style: {
            variant: 'kraft',
        },
    };
}

function applyMediaToPhotoElement(canvas: Canvas, elementId: string, mediaItem: EditorMediaItem): Canvas {
    const target = canvas.elements.find((element) => element.id === elementId);

    if (target?.type === 'image') {
        return applyMediaToImageElement(canvas, elementId, mediaItem);
    }

    if (target?.type !== 'flip_polaroid') {
        return canvas;
    }

    return {
        ...canvas,
        elements: canvas.elements.map((element) => {
            if (element.id !== elementId || element.type !== 'flip_polaroid') {
                return element;
            }

            const record = element as CanvasElement & Record<string, unknown>;
            const front = isRecord(record.front) ? record.front : {};
            const nextFront = { ...front };

            delete nextFront.media_item_id;

            return {
                ...record,
                front: {
                    ...nextFront,
                    mediaItemId: mediaItem.id,
                    src: mediaItem.url,
                },
            };
        }),
    };
}

function defaultAssetSize(asset: EditorAsset, canvas: Canvas): { h: number; w: number } {
    const transform = resolveAssetDefaultTransform(asset, {
        artboardHeight: canvas.artboard.height,
        artboardWidth: canvas.artboard.width,
    });

    return {
        w: Math.min(transform.w, Math.round(canvas.artboard.width * 0.96)),
        h: Math.min(transform.h, Math.round(canvas.artboard.height * 0.96)),
    };
}

function defaultAssetRotation(asset: EditorAsset): number {
    return resolveAssetDefaultTransform(asset).rotation;
}

function mergeAssets(current: EditorAsset[], incoming: EditorAsset[]): EditorAsset[] {
    const merged = new Map<string, EditorAsset>();

    for (const asset of current) {
        merged.set(String(asset.id), asset);
    }

    for (const asset of incoming) {
        merged.set(String(asset.id), asset);
    }

    return [...merged.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canModifyElement(element: CanvasElement | null | undefined): element is CanvasElement {
    return Boolean(
        element && isTransformableElement(element) && !isElementLocked(element) && !isElementHidden(element),
    );
}

function isEditableKeyboardTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (target.isContentEditable) {
        return true;
    }

    const tagName = target.tagName.toLowerCase();

    return tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}
