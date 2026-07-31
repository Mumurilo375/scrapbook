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
        <section className="gift-editor-workspace scrapbook-editor-workspace" data-editor-layout="scrapbook">
            <aside
                aria-label="Sequência de páginas do presente"
                className="gift-editor-page-rail scrapbook-editor-filmstrip-slot"
                data-editor-slot="filmstrip"
            >
                {left}
            </aside>
            <section
                aria-label="Página do scrapbook em edição"
                className="gift-editor-stage-column scrapbook-editor-stage-slot"
                data-editor-slot="stage"
            >
                {center}
            </section>
            <aside
                aria-label="Ferramentas de edição"
                className="gift-editor-tool-dock scrapbook-editor-inspector scrapbook-editor-inspector-slot"
                data-editor-slot="inspector"
                data-expanded={toolsExpanded}
            >
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
