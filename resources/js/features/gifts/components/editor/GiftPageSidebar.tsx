import { Eye, EyeOff, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import type { EditorPage, SaveStatus } from './editorTypes';

type GiftPageSidebarProps = {
    onSelectPage: (pageId: string) => void;
    pages: EditorPage[];
    pageStatuses?: Record<string, SaveStatus>;
    selectedPageId: string | null;
};

export function GiftPageSidebar({ onSelectPage, pageStatuses = {}, pages, selectedPageId }: GiftPageSidebarProps) {
    return (
        <nav
            aria-label="Páginas do scrapbook"
            className="overflow-hidden border border-[#3F3049] bg-[#21162D] text-[#FBFAF6] shadow-[0_8px_24px_rgba(33,22,45,0.18)] lg:max-h-[calc(100vh-112px)]"
        >
            <div className="flex items-end justify-between gap-4 border-b border-[#4B3B55] px-3 py-3 lg:block lg:px-4 lg:py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold tracking-[-0.01em]">
                    <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#FF765B]" />
                    Páginas do álbum
                </h2>
                <p className="text-xs text-[#C9C1CD] lg:mt-1.5 lg:pl-[1.125rem]">{pageCountLabel(pages.length)}</p>
            </div>
            <ol className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-3 px-3 py-3 [scrollbar-color:#746D78_transparent] [scrollbar-width:thin] lg:max-h-[calc(100vh-184px)] lg:snap-none lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:px-3 lg:py-3">
                {pages.map((page, pageIndex) => {
                    const selected = page.id === selectedPageId;
                    const saveStatus = pageStatuses[page.id] ?? 'idle';

                    return (
                        <li className="w-[10.75rem] shrink-0 snap-start lg:w-full" key={page.id}>
                            <button
                                aria-current={selected ? 'page' : undefined}
                                className={`group grid min-h-[4.75rem] w-full grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2.5 border px-2.5 py-2 text-left [clip-path:polygon(0_0,calc(100%_-_9px)_0,100%_9px,100%_100%,0_100%)] transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF765B] motion-reduce:transform-none motion-reduce:transition-none ${
                                    selected
                                        ? 'border-[#FBFAF6] bg-[#FBFAF6] text-[#21162D] shadow-[4px_4px_0_#FF765B]'
                                        : 'border-[#51405C] bg-[#30223A] text-[#FBFAF6] hover:border-[#746D78] hover:bg-[#392944] active:translate-y-px'
                                }`}
                                onClick={() => onSelectPage(page.id)}
                                type="button"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`relative grid h-14 w-11 content-between border px-1.5 py-1.5 text-center ${
                                        selected
                                            ? 'border-[#C9C1CD] bg-white text-[#21162D]'
                                            : 'border-[#DCD5E0] bg-[#FBFAF6] text-[#21162D]'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold tracking-[0.12em] text-[#746D78]">PÁG.</span>
                                    <span className="text-lg font-extrabold leading-none tracking-[-0.03em]">
                                        {formatPageNumber(pageIndex + 1)}
                                    </span>
                                    <span className="mx-auto h-px w-5 bg-[#FF765B]" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold tracking-[-0.01em]">
                                        {page.name}
                                    </span>
                                    <span
                                        className={`mt-1.5 flex items-center justify-between gap-1.5 text-[11px] ${
                                            selected ? 'text-[#746D78]' : 'text-[#C9C1CD]'
                                        }`}
                                    >
                                        <span className="min-w-0 truncate">{pageTypeLabel(page.page_type)}</span>
                                        <span className="flex shrink-0 items-center gap-1">
                                            {page.is_visible ? (
                                                <StatusIcon label="Página visível">
                                                    <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                                                </StatusIcon>
                                            ) : (
                                                <StatusIcon label="Página oculta">
                                                    <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                                                </StatusIcon>
                                            )}
                                            {page.locked && (
                                                <StatusIcon label="Página bloqueada">
                                                    <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                                                </StatusIcon>
                                            )}
                                            <PageStatusDot status={saveStatus} />
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

function StatusIcon({ children, label }: { children: ReactNode; label: string }) {
    return (
        <span className="inline-flex h-5 w-5 items-center justify-center" title={label}>
            {children}
            <span className="sr-only">{label}</span>
        </span>
    );
}

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
        return '1 página no rascunho';
    }

    return `${count} páginas no rascunho`;
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
