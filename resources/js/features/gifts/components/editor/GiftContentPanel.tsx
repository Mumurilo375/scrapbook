import { Lock, Type } from 'lucide-react';

import type { EditableTextElement, SaveStatus } from './editorTypes';

type GiftContentPanelProps = {
    disabled: boolean;
    elements: EditableTextElement[];
    error?: string | null;
    onChangeText: (element: EditableTextElement, value: string) => void;
    saveStatus: SaveStatus;
};

export function GiftContentPanel({ disabled, elements, error, onChangeText, saveStatus }: GiftContentPanelProps) {
    return (
        <section className="grid gap-5 text-[#342E38]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">
                        Conteúdo da página
                    </h2>
                    <p className="mt-1 text-sm text-[#746D78]">{contentStatusLabel(elements.length, saveStatus)}</p>
                </div>
                {disabled ? (
                    <Lock aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#746D78]" />
                ) : (
                    <Type aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#FF765B]" />
                )}
            </div>

            {error ? (
                <p
                    className="rounded-[6px] border border-[#C85B47] bg-[#FFF2EF] px-3 py-2.5 text-sm font-semibold text-[#7C3024]"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}

            {elements.length > 0 ? (
                <div className="grid gap-4">
                    {elements.map((element) => (
                        <label className="grid gap-2 text-sm font-semibold text-[#342E38]" key={element.id}>
                            <span className="capitalize">{element.label}</span>
                            <textarea
                                className="min-h-28 resize-y rounded-[6px] border border-[#978E9C] bg-white p-3 text-sm font-normal leading-6 text-[#342E38] outline-none transition placeholder:text-[#746D78] focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                                disabled={disabled}
                                maxLength={element.maxLength}
                                onChange={(event) => onChangeText(element, event.target.value)}
                                value={element.value}
                            />
                            <span className="text-right text-xs font-medium text-[#746D78]">
                                {element.value.length}/{element.maxLength}
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm text-[#342E38]">
                    Esta página ainda não possui textos editáveis.
                </p>
            )}
        </section>
    );
}

function contentStatusLabel(count: number, status: SaveStatus): string {
    const countLabel = count === 1 ? '1 texto editável' : `${count} textos editáveis`;

    return `${countLabel} - ${statusLabel(status)}`;
}

function statusLabel(status: SaveStatus): string {
    if (status === 'dirty') {
        return 'pendente';
    }

    if (status === 'saving') {
        return 'salvando';
    }

    if (status === 'error') {
        return 'erro';
    }

    if (status === 'offline') {
        return 'sem conexão';
    }

    return 'salvo';
}
