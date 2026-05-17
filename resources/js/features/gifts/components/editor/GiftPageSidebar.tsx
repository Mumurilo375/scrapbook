import { Eye, EyeOff, Lock } from 'lucide-react';

import type { EditorPage } from './editorTypes';

type GiftPageSidebarProps = {
    onSelectPage: (pageId: string) => void;
    pages: EditorPage[];
    selectedPageId: string | null;
};

export function GiftPageSidebar({ onSelectPage, pages, selectedPageId }: GiftPageSidebarProps) {
    return (
        <div className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-3 shadow-sm lg:sticky lg:top-24">
            <div className="px-2 pb-3">
                <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Páginas</h2>
                <p className="mt-1 text-xs text-[#6F5A4A]">{pages.length} páginas no rascunho</p>
            </div>
            <div className="grid gap-2">
                {pages.map((page) => {
                    const selected = page.id === selectedPageId;

                    return (
                        <button
                            className={`w-full rounded-[6px] border p-3 text-left transition ${
                                selected
                                    ? 'border-[#8F211F] bg-[#F8D8D3] text-[#1F150A]'
                                    : 'border-[#E5D0B8] bg-white text-[#42291D] hover:border-[#CBA980] hover:bg-[#FFFBF6]'
                            }`}
                            key={page.id}
                            onClick={() => onSelectPage(page.id)}
                            type="button"
                        >
                            <span className="text-xs font-semibold uppercase text-[#D93632]">Página {page.sort_order}</span>
                            <span className="mt-1 block truncate text-sm font-semibold">{page.name}</span>
                            <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6F5A4A]">
                                <span>{page.page_type}</span>
                                {page.is_visible ? <Eye aria-hidden="true" className="h-3.5 w-3.5" /> : <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />}
                                {page.locked && <Lock aria-hidden="true" className="h-3.5 w-3.5" />}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
