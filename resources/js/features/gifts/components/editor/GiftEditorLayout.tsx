import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

type GiftEditorLayoutProps = {
    left: ReactNode;
    center: ReactNode;
    right: ReactNode;
};

export function GiftEditorLayout({ center, left, right }: GiftEditorLayoutProps) {
    const [toolsExpanded, setToolsExpanded] = useState(false);

    return (
        <section className="gift-editor-workspace">
            <aside className="gift-editor-page-rail" aria-label="Páginas do presente">
                {left}
            </aside>
            <section className="gift-editor-stage-column">{center}</section>
            <aside className="gift-editor-tool-dock" aria-label="Ferramentas de edição" data-expanded={toolsExpanded}>
                <button
                    aria-controls="gift-editor-tools"
                    aria-expanded={toolsExpanded}
                    className="gift-editor-sheet-toggle"
                    onClick={() => setToolsExpanded((expanded) => !expanded)}
                    type="button"
                >
                    <span aria-hidden="true" className="gift-editor-sheet-handle" />
                    <span className="gift-editor-sheet-toggle-label">
                        <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                        Ferramentas da página
                    </span>
                    {toolsExpanded ? (
                        <ChevronDown aria-hidden="true" className="h-5 w-5" />
                    ) : (
                        <ChevronUp aria-hidden="true" className="h-5 w-5" />
                    )}
                </button>
                <div className="gift-editor-tool-scroll" id="gift-editor-tools">
                    {right}
                </div>
            </aside>
        </section>
    );
}
