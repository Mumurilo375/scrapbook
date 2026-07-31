import { Eye, EyeOff, Lock } from 'lucide-react';
import { memo, useEffect, useRef } from 'react';

import { PageRenderer, type RendererAssetMap, type ThemeConfigInput } from '../../../../components/renderer';
import type { Canvas } from '../../../../domain/canvas/schema';
import type { EditorPage, SaveStatus } from './editorTypes';

type GiftPageSidebarProps = {
    assets?: RendererAssetMap;
    onSelectPage: (pageId: string) => void;
    pageCanvases?: Record<string, Canvas>;
    pages: EditorPage[];
    pageStatuses?: Record<string, SaveStatus>;
    selectedPageId: string | null;
    theme?: ThemeConfigInput;
};

export function GiftPageSidebar({
    assets,
    onSelectPage,
    pageCanvases = {},
    pageStatuses = {},
    pages,
    selectedPageId,
    theme,
}: GiftPageSidebarProps) {
    const selectedItemRef = useRef<HTMLLIElement | null>(null);

    useEffect(() => {
        selectedItemRef.current?.scrollIntoView({
            block: 'nearest',
            inline: 'center',
        });
    }, [selectedPageId]);

    return (
        <nav
            aria-label="Páginas do scrapbook"
            className="gift-page-sidebar scrapbook-editor-filmstrip flex min-w-0 items-stretch overflow-hidden border-y border-[#3F3049] bg-[#21162D] text-[#FBFAF6] shadow-[0_8px_24px_rgba(33,22,45,0.18)]"
            data-page-count={pages.length}
        >
            <div className="gift-page-sidebar-heading scrapbook-editor-filmstrip-heading flex w-[7.25rem] shrink-0 flex-col justify-center border-r border-[#4B3B55] px-3 py-3 sm:w-[9.5rem] sm:px-4">
                <h2 className="flex items-center gap-2 text-sm font-bold tracking-[-0.01em]">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#FF765B]" />
                    Páginas
                </h2>
                <p className="mt-1 pl-[1.125rem] text-[11px] leading-tight text-[#C9C1CD]">
                    {pageCountLabel(pages.length)}
                </p>
            </div>
            <ol className="gift-page-sidebar-list scrapbook-editor-filmstrip-list flex min-w-0 flex-1 snap-x snap-mandatory items-stretch gap-2.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 py-2.5 [scrollbar-color:#746D78_transparent] [scrollbar-width:thin]">
                {pages.map((page, pageIndex) => {
                    const selected = page.id === selectedPageId;
                    const saveStatus = pageStatuses[page.id] ?? 'idle';
                    const canvas = pageCanvases[page.id] ?? page.canvas;

                    return (
                        <li
                            className="gift-page-sidebar-item scrapbook-editor-filmstrip-item relative w-[9.5rem] shrink-0 snap-start"
                            data-locked={page.locked}
                            data-save-status={saveStatus}
                            data-selected={selected}
                            data-visible={page.is_visible}
                            key={page.id}
                            ref={selected ? selectedItemRef : undefined}
                        >
                            <div
                                className={`gift-page-sidebar-card relative grid h-full min-h-[7.25rem] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border bg-[#30223A] transition-[background-color,border-color,box-shadow,transform] duration-150 motion-reduce:transition-none ${
                                    selected
                                        ? 'border-[#FBFAF6] bg-[#FBFAF6] text-[#21162D] shadow-[3px_3px_0_#FF765B]'
                                        : 'border-[#51405C] text-[#FBFAF6]'
                                }`}
                            >
                                <div className="gift-page-sidebar-thumbnail relative min-h-0 overflow-hidden bg-[#EFEBF3]">
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-1 flex items-center justify-center overflow-hidden select-none"
                                        inert
                                    >
                                        <PageThumbnail assets={assets} canvas={canvas} theme={theme} />
                                    </div>
                                    <span className="absolute top-1.5 left-1.5 z-10 grid min-w-7 place-items-center bg-[#21162D] px-1.5 py-1 text-[10px] font-extrabold leading-none text-[#FBFAF6] shadow-[2px_2px_0_#FF765B]">
                                        {formatPageNumber(pageIndex + 1)}
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="absolute right-1.5 bottom-1.5 z-10 flex items-center gap-0.5 bg-[#21162D]/90 px-1 py-0.5 text-[#FBFAF6]"
                                    >
                                        {page.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                        {page.locked ? <Lock className="h-3 w-3" /> : null}
                                        <PageStatusDot status={saveStatus} />
                                    </span>
                                </div>
                                <span
                                    className={`min-w-0 border-t px-2 py-1.5 ${
                                        selected ? 'border-[#D8D1DC]' : 'border-[#51405C]'
                                    }`}
                                >
                                    <span className="block truncate text-xs font-bold tracking-[-0.01em]">
                                        {page.name}
                                    </span>
                                    <span
                                        className={`mt-0.5 block truncate text-[10px] leading-tight ${
                                            selected ? 'text-[#746D78]' : 'text-[#C9C1CD]'
                                        }`}
                                    >
                                        {pageTypeLabel(page.page_type)}
                                    </span>
                                </span>
                            </div>
                            <button
                                aria-current={selected ? 'page' : undefined}
                                aria-label={pageSelectionLabel(page, pageIndex, saveStatus, selected)}
                                className="absolute inset-0 z-20 cursor-pointer bg-transparent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FF765B]"
                                onClick={() => onSelectPage(page.id)}
                                type="button"
                            />
                        </li>
                    );
                })}
                {pages.length === 0 ? (
                    <li className="flex min-w-52 items-center justify-center border border-dashed border-[#51405C] px-4 text-center text-xs text-[#C9C1CD]">
                        As páginas do presente aparecerão aqui.
                    </li>
                ) : null}
            </ol>
        </nav>
    );
}

const PageThumbnail = memo(function PageThumbnail({
    assets,
    canvas,
    theme,
}: {
    assets?: RendererAssetMap;
    canvas: Canvas;
    theme?: ThemeConfigInput;
}) {
    return (
        <div
            className="h-full max-w-full"
            style={{ aspectRatio: `${canvas.artboard.width} / ${canvas.artboard.height}` }}
        >
            <PageRenderer assets={assets} canvas={canvas} context="preview" theme={theme} />
        </div>
    );
});

function PageStatusDot({ status }: { status: SaveStatus }) {
    if (status === 'dirty') {
        return <StatusDot color="bg-[#B86C22]" label="Alterações pendentes" />;
    }

    if (status === 'saving') {
        return <StatusDot animated color="bg-[#FF765B]" label="Salvando" />;
    }

    if (status === 'error') {
        return <StatusDot color="bg-[#C63C43]" label="Erro ao salvar" />;
    }

    if (status === 'offline') {
        return <StatusDot color="bg-[#746D78]" label="Sem conexão" />;
    }

    return <StatusDot color="bg-[#357263]" label="Salvo" />;
}

function StatusDot({ animated = false, color, label }: { animated?: boolean; color: string; label: string }) {
    return (
        <span className="inline-flex h-5 w-5 items-center justify-center" title={label}>
            <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${animated ? 'animate-pulse motion-reduce:animate-none' : ''} ${color}`}
            />
            <span className="sr-only">{label}</span>
        </span>
    );
}

function formatPageNumber(pageNumber: number): string {
    return String(pageNumber).padStart(2, '0');
}

function pageCountLabel(count: number): string {
    if (count === 1) {
        return '1 página';
    }

    return `${count} páginas`;
}

function pageTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        birthday: 'Aniversário',
        cover: 'Capa',
        final: 'Final',
        gallery: 'Galeria',
        letter: 'Carta',
        love_list: 'Lista afetiva',
        music: 'Música',
    };

    return labels[type] ?? 'Página';
}

function pageSelectionLabel(page: EditorPage, pageIndex: number, status: SaveStatus, selected: boolean): string {
    return [
        `Página ${pageIndex + 1}: ${page.name}`,
        pageTypeLabel(page.page_type),
        page.is_visible ? 'visível' : 'oculta',
        page.locked ? 'bloqueada' : 'desbloqueada',
        saveStatusLabel(status),
        selected ? 'selecionada' : 'selecionar página',
    ].join(', ');
}

function saveStatusLabel(status: SaveStatus): string {
    const labels: Record<SaveStatus, string> = {
        dirty: 'alterações pendentes',
        error: 'erro ao salvar',
        idle: 'salva',
        offline: 'sem conexão',
        saved: 'salva',
        saving: 'salvando',
    };

    return labels[status];
}
