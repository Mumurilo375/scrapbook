import { Code2, FileImage, Gift, Images, Layers, Shapes, Sparkles, Type } from 'lucide-react';
import type { KeyboardEvent } from 'react';

import type { EditorTab } from './editorTypes';

type EditorTabsProps = {
    activeTab: EditorTab;
    onChange: (tab: EditorTab) => void;
    showDebug: boolean;
};

const TABS: Array<{ id: EditorTab; label: string; icon: typeof Type }> = [
    { id: 'content', label: 'Textos', icon: Type },
    { id: 'images', label: 'Fotos', icon: Images },
    { id: 'stickers', label: 'Adesivos', icon: Sparkles },
    { id: 'interactive', label: 'Interagir', icon: Shapes },
    { id: 'page', label: 'Página', icon: FileImage },
    { id: 'gift', label: 'Presente', icon: Gift },
    { id: 'layers', label: 'Camadas', icon: Layers },
    { id: 'debug', label: 'Debug', icon: Code2 },
];

export function EditorTabs({ activeTab, onChange, showDebug }: EditorTabsProps) {
    return (
        <div
            aria-label="Painéis do editor"
            className="grid grid-cols-4 gap-1 border-y border-[#C9C1CD] bg-[#EFEBF3] p-1.5 text-[11px] font-bold text-[#342E38] sm:text-xs"
            role="tablist"
        >
            {TABS.filter((tab) => showDebug || tab.id !== 'debug').map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                    <button
                        aria-controls="editor-active-panel"
                        aria-selected={selected}
                        className={`relative inline-flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 border px-1.5 py-1.5 [clip-path:polygon(0_0,calc(100%_-_8px)_0,100%_8px,100%_100%,0_100%)] transition-[background-color,border-color,color] duration-150 focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF765B] motion-reduce:transition-none ${
                            selected
                                ? 'z-10 border-[#21162D] bg-[#21162D] text-[#FBFAF6] shadow-[inset_0_-3px_0_#FF765B]'
                                : 'border-[#C9C1CD] bg-[#FBFAF6] text-[#5B5360] hover:border-[#746D78] hover:bg-white hover:text-[#21162D]'
                        }`}
                        data-tab={tab.id}
                        id={`editor-tab-${tab.id}`}
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        onKeyDown={(event) => handleTabKeyDown(event, onChange)}
                        role="tab"
                        tabIndex={selected ? 0 : -1}
                        type="button"
                    >
                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                        <span className="min-w-0 truncate">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, onChange: (tab: EditorTab) => void) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
    }

    const tabButtons = Array.from(
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentIndex = tabButtons.indexOf(event.currentTarget);

    if (currentIndex === -1 || tabButtons.length === 0) {
        return;
    }

    event.preventDefault();

    const nextIndex =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabButtons.length - 1
              : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabButtons.length) % tabButtons.length;
    const nextTab = tabButtons[nextIndex];
    const nextTabId = nextTab.dataset.tab as EditorTab | undefined;

    if (!nextTabId) {
        return;
    }

    nextTab.focus();
    onChange(nextTabId);
}
