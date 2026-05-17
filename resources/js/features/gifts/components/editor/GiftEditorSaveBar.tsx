import { AlertCircle, CheckCircle2, Save } from 'lucide-react';

import type { EditorSaveState } from './editorTypes';

type GiftEditorSaveBarProps = {
    disabled: boolean;
    error: string | null;
    onSave: () => void;
    saveState: EditorSaveState;
};

export function GiftEditorSaveBar({ disabled, error, onSave, saveState }: GiftEditorSaveBarProps) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Salvamento</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#42291D]">
                        {saveState === 'error' ? <AlertCircle aria-hidden="true" className="h-4 w-4 text-[#D93632]" /> : null}
                        {saveState === 'saved' ? <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-[#6F7E55]" /> : null}
                        {stateLabel(saveState)}
                    </p>
                </div>
                <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827] disabled:opacity-60"
                    disabled={disabled || saveState === 'saving'}
                    onClick={onSave}
                    type="button"
                >
                    <Save aria-hidden="true" className="h-4 w-4" />
                    {saveState === 'saving' ? 'Salvando...' : 'Salvar página'}
                </button>
            </div>
            {error && <p className="mt-3 text-sm font-semibold text-[#D93632]">{error}</p>}
        </section>
    );
}

function stateLabel(saveState: EditorSaveState): string {
    if (saveState === 'dirty') {
        return 'Alterações não salvas';
    }

    if (saveState === 'saving') {
        return 'Salvando...';
    }

    if (saveState === 'saved') {
        return 'Salvo';
    }

    if (saveState === 'error') {
        return 'Erro ao salvar';
    }

    return 'Sem alterações';
}
