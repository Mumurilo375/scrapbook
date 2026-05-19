import { Code2, FileImage, Gift, Images, Layers, Shapes, Sparkles, Type } from 'lucide-react';

import type { EditorTab } from './editorTypes';

type EditorTabsProps = {
    activeTab: EditorTab;
    onChange: (tab: EditorTab) => void;
    showDebug: boolean;
};

const TABS: Array<{ id: EditorTab; label: string; icon: typeof Type }> = [
    { id: 'content', label: 'Conteúdo', icon: Type },
    { id: 'images', label: 'Imagens', icon: Images },
    { id: 'stickers', label: 'Adesivos', icon: Sparkles },
    { id: 'interactive', label: 'Elementos', icon: Shapes },
    { id: 'page', label: 'Página', icon: FileImage },
    { id: 'gift', label: 'Presente', icon: Gift },
    { id: 'layers', label: 'Camadas', icon: Layers },
    { id: 'debug', label: 'Debug', icon: Code2 },
];

export function EditorTabs({ activeTab, onChange, showDebug }: EditorTabsProps) {
    return (
        <div
            aria-label="Painéis do editor"
            className="flex flex-nowrap gap-1 overflow-x-auto rounded-[8px] border border-[#D8B991] bg-[#F6E7D6] p-1 text-xs font-semibold text-[#42291D] sm:flex-wrap sm:overflow-visible sm:text-sm"
            role="tablist"
        >
            {TABS.filter((tab) => showDebug || tab.id !== 'debug').map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                    <button
                        aria-selected={selected}
                        className={`inline-flex min-h-10 min-w-[7.25rem] shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-2 transition sm:min-h-10 sm:min-w-0 sm:flex-1 sm:basis-[8.5rem] sm:gap-2 ${
                            selected ? 'bg-[#FFF8EF] text-[#7A2634] shadow-sm' : 'text-[#6F5A4A] hover:bg-[#FFF8EF]/65'
                        }`}
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        role="tab"
                        type="button"
                    >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
