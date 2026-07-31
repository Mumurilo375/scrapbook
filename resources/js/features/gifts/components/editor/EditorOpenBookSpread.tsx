import type { CSSProperties, ReactNode } from 'react';

import type { Canvas } from '../../../../domain/canvas/schema';

type EditorOpenBookSpreadProps = {
    activeCanvas: Canvas;
    activePage: ReactNode;
    activePageNumber: number;
    activeSide: 'left' | 'right';
    companionCanvas?: Canvas | null;
    companionPage?: ReactNode;
    companionPageNumber?: number;
    direction: 'next' | 'previous';
    onSelectCompanion?: () => void;
};

export function EditorOpenBookSpread({
    activeCanvas,
    activePage,
    activePageNumber,
    activeSide,
    companionCanvas = null,
    companionPage,
    companionPageNumber,
    direction,
    onSelectCompanion,
}: EditorOpenBookSpreadProps) {
    const leftPage =
        activeSide === 'left'
            ? { canvas: activeCanvas, content: activePage, number: activePageNumber, selected: true }
            : {
                  canvas: companionCanvas ?? activeCanvas,
                  content: companionPage,
                  number: companionPageNumber,
                  selected: false,
              };
    const rightPage =
        activeSide === 'right'
            ? { canvas: activeCanvas, content: activePage, number: activePageNumber, selected: true }
            : {
                  canvas: companionCanvas ?? activeCanvas,
                  content: companionPage,
                  number: companionPageNumber,
                  selected: false,
              };
    const style = {
        '--editor-book-page-ratio': `${activeCanvas.artboard.width} / ${activeCanvas.artboard.height}`,
    } as CSSProperties;

    return (
        <div
            aria-label={`Álbum aberto na página ${activePageNumber}`}
            className="editor-open-book"
            data-active-side={activeSide}
            data-direction={direction}
            style={style}
        >
            <div aria-hidden="true" className="editor-open-book__cover" />
            <div aria-hidden="true" className="editor-open-book__paper-stack editor-open-book__paper-stack--back" />
            <div aria-hidden="true" className="editor-open-book__paper-stack editor-open-book__paper-stack--middle" />

            <div className="editor-open-book__spread">
                <BookPage
                    canvas={leftPage.canvas}
                    number={leftPage.number}
                    onSelect={leftPage.selected ? undefined : onSelectCompanion}
                    selected={leftPage.selected}
                    side="left"
                >
                    {leftPage.content}
                </BookPage>
                <BookPage
                    canvas={rightPage.canvas}
                    number={rightPage.number}
                    onSelect={rightPage.selected ? undefined : onSelectCompanion}
                    selected={rightPage.selected}
                    side="right"
                >
                    {rightPage.content}
                </BookPage>
            </div>

            <div aria-hidden="true" className="editor-open-book__gutter" />
            <div aria-hidden="true" className="editor-open-book__binding">
                {[18, 39, 61, 82].map((top) => (
                    <span className="editor-open-book__ring" key={top} style={{ top: `${top}%` }} />
                ))}
            </div>
            <span aria-hidden="true" className="editor-open-book__page-curl" />
        </div>
    );
}

type BookPageProps = {
    canvas: Canvas;
    children?: ReactNode;
    number?: number;
    onSelect?: () => void;
    selected: boolean;
    side: 'left' | 'right';
};

function BookPage({ canvas, children, number, onSelect, selected, side }: BookPageProps) {
    const style = {
        aspectRatio: `${canvas.artboard.width} / ${canvas.artboard.height}`,
    } as CSSProperties;

    return (
        <div
            className="editor-open-book__page"
            data-empty={!children}
            data-selected={selected}
            data-side={side}
            style={style}
        >
            <div aria-hidden="true" className="editor-open-book__page-underlay" />
            <div className="editor-open-book__page-content">
                {children ?? (
                    <div aria-hidden="true" className="editor-open-book__empty-page">
                        <span />
                        <span />
                        <span />
                    </div>
                )}
            </div>
            {number ? (
                <span aria-hidden="true" className="editor-open-book__folio">
                    {String(number).padStart(2, '0')}
                </span>
            ) : null}
            {onSelect ? (
                <button
                    aria-label={`Editar página ${number ?? ''}`.trim()}
                    className="editor-open-book__companion-action"
                    onClick={onSelect}
                    type="button"
                />
            ) : null}
        </div>
    );
}
