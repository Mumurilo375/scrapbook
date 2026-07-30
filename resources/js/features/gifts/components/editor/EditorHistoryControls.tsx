import { Redo2, Undo2 } from 'lucide-react';

type EditorHistoryControlsProps = {
    canRedo: boolean;
    canUndo: boolean;
    disabled: boolean;
    onRedo: () => void;
    onUndo: () => void;
};

export function EditorHistoryControls({ canRedo, canUndo, disabled, onRedo, onUndo }: EditorHistoryControlsProps) {
    return (
        <div
            aria-label="Histórico da edição"
            className="inline-flex shrink-0 snap-start overflow-hidden rounded-[5px] border border-[#4B3A58] bg-[#2A1D36]"
            role="group"
        >
            <button
                aria-label="Desfazer"
                className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-bold text-[#F8F5FA] transition-colors hover:bg-[#382943] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF765B] disabled:cursor-not-allowed disabled:text-[#766A7D]"
                disabled={disabled || !canUndo}
                onClick={onUndo}
                title="Desfazer"
                type="button"
            >
                <Undo2 aria-hidden="true" className="h-4 w-4" />
                <span className="lg:hidden 2xl:inline">Desfazer</span>
            </button>
            <span aria-hidden="true" className="w-px bg-[#4B3A58]" />
            <button
                aria-label="Refazer"
                className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-bold text-[#F8F5FA] transition-colors hover:bg-[#382943] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF765B] disabled:cursor-not-allowed disabled:text-[#766A7D]"
                disabled={disabled || !canRedo}
                onClick={onRedo}
                title="Refazer"
                type="button"
            >
                <Redo2 aria-hidden="true" className="h-4 w-4" />
                <span className="lg:hidden 2xl:inline">Refazer</span>
            </button>
        </div>
    );
}
