import type { NormalizedViewerPage } from './viewerTypes';

type GiftPageNavigatorProps = {
    activePageIndex: number;
    onSelectPage: (index: number) => void;
    pages: NormalizedViewerPage[];
};

export function GiftPageNavigator({ activePageIndex, onSelectPage, pages }: GiftPageNavigatorProps) {
    if (pages.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="Páginas do scrapbook" className="mx-auto flex w-full max-w-[850px] gap-2 overflow-x-auto pb-1">
            {pages.map((page, index) => {
                const selected = index === activePageIndex;

                return (
                    <button
                        aria-current={selected ? 'page' : undefined}
                        className={`min-h-10 shrink-0 rounded-[6px] border px-3 text-sm font-semibold ${
                            selected
                                ? 'border-[#7A2634] bg-[#7A2634] text-white'
                                : 'border-[#CBA980] bg-[#FFF7EE] text-[#42291D] hover:bg-[#EAD2B8]'
                        }`}
                        key={page.id}
                        onClick={() => onSelectPage(index)}
                        type="button"
                    >
                        {page.name || `Página ${index + 1}`}
                    </button>
                );
            })}
        </nav>
    );
}
