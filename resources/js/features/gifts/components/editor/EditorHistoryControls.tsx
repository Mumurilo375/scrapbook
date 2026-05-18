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
        <div className="inline-flex shrink-0 overflow-hidden rounded-[6px] border border-[#CBA980] bg-[#FFF7EE]">
            <button
                aria-label="Desfazer"
                className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold text-[#42291D] transition hover:bg-[#EAD2B8] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={disabled || !canUndo}
                onClick={onUndo}
                title="Desfazer"
                type="button"
            >
                <Undo2 aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">Desfazer</span>
            </button>
            <span className="w-px bg-[#CBA980]" />
            <button
                aria-label="Refazer"
                className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold text-[#42291D] transition hover:bg-[#EAD2B8] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={disabled || !canRedo}
                onClick={onRedo}
                title="Refazer"
                type="button"
            >
                <Redo2 aria-hidden="true" className="h-4 w-4" />
                <span className="hidden lg:inline">Refazer</span>
            </button>
        </div>
    );
}
