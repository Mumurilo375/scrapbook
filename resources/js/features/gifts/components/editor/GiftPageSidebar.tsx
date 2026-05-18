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
        <div className="max-h-[42vh] overflow-y-auto rounded-[8px] border border-[#D8B991] bg-[#FFF7EE]/95 p-3 shadow-sm lg:max-h-[calc(100vh-112px)]">
            <div className="px-2 pb-3">
                <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Páginas</h2>
                <p className="mt-1 text-xs text-[#6F5A4A]">{pageCountLabel(pages.length)}</p>
            </div>
            <div className="grid gap-2">
                {pages.map((page) => {
                    const selected = page.id === selectedPageId;
                    const saveStatus = pageStatuses[page.id] ?? 'idle';

                    return (
                        <button
                            aria-current={selected ? 'page' : undefined}
                            className={`w-full rounded-[6px] border p-3 text-left transition ${
                                selected
                                    ? 'border-[#8F211F] bg-[#F8D8D3] text-[#1F150A]'
                                    : 'border-[#E5D0B8] bg-white text-[#42291D] hover:border-[#CBA980] hover:bg-[#FFFBF6]'
                            }`}
                            key={page.id}
                            onClick={() => onSelectPage(page.id)}
                            type="button"
                        >
                            <span className="text-xs font-semibold uppercase text-[#D93632]">
                                Página {page.sort_order}
                            </span>
                            <span className="mt-1 block truncate text-sm font-semibold">{page.name}</span>
                            <span className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6F5A4A]">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="truncate">{pageTypeLabel(page.page_type)}</span>
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
                                </span>
                                <PageStatusDot status={saveStatus} />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function StatusIcon({ children, label }: { children: ReactNode; label: string }) {
    return (
        <span title={label}>
            {children}
            <span className="sr-only">{label}</span>
        </span>
    );
}

function PageStatusDot({ status }: { status: SaveStatus }) {
    if (status === 'dirty') {
        return <StatusDot color="bg-[#C68928]" label="Alterações pendentes" />;
    }

    if (status === 'saving') {
        return <StatusDot animated color="bg-[#7A2634]" label="Salvando" />;
    }

    if (status === 'error') {
        return <StatusDot color="bg-[#D93632]" label="Erro ao salvar" />;
    }

    if (status === 'offline') {
        return <StatusDot color="bg-[#6F5A4A]" label="Sem conexão" />;
    }

    return <StatusDot color="bg-[#8AA05B]" label="Salvo" />;
}

function StatusDot({ animated = false, color, label }: { animated?: boolean; color: string; label: string }) {
    return (
        <span className={`h-2 w-2 rounded-full ${animated ? 'animate-pulse' : ''} ${color}`} title={label}>
            <span className="sr-only">{label}</span>
        </span>
    );
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
