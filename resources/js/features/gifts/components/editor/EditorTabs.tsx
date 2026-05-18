import { Code2, Gift, Images, Layers, Type } from 'lucide-react';

import type { EditorTab } from './editorTypes';

type EditorTabsProps = {
    activeTab: EditorTab;
    onChange: (tab: EditorTab) => void;
    showDebug: boolean;
};

const TABS: Array<{ id: EditorTab; label: string; icon: typeof Type }> = [
    { id: 'content', label: 'Conteúdo', icon: Type },
    { id: 'images', label: 'Imagens', icon: Images },
    { id: 'gift', label: 'Presente', icon: Gift },
    { id: 'layers', label: 'Camadas', icon: Layers },
    { id: 'debug', label: 'Debug', icon: Code2 },
];

export function EditorTabs({ activeTab, onChange, showDebug }: EditorTabsProps) {
    return (
        <div className="flex flex-wrap gap-1 rounded-[8px] border border-[#D8B991] bg-[#F6E7D6] p-1 text-xs font-semibold text-[#42291D] sm:text-sm">
            {TABS.filter((tab) => showDebug || tab.id !== 'debug').map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;

                return (
                    <button
                        className={`inline-flex min-h-9 flex-1 basis-[6.75rem] items-center justify-center gap-1.5 rounded-[6px] px-2 transition sm:min-h-10 sm:basis-[8.5rem] sm:gap-2 ${
                            selected ? 'bg-[#FFF8EF] text-[#7A2634] shadow-sm' : 'text-[#6F5A4A] hover:bg-[#FFF8EF]/65'
                        }`}
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
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
