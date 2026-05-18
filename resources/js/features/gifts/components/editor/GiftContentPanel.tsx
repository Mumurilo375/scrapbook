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
        <section className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-[#1F150A]">Conteúdo da página</h2>
                    <p className="mt-1 text-sm text-[#6F5A4A]">{contentStatusLabel(elements.length, saveStatus)}</p>
                </div>
                {disabled ? (
                    <Lock aria-hidden="true" className="h-4 w-4 text-[#7A5A43]" />
                ) : (
                    <Type aria-hidden="true" className="h-4 w-4 text-[#D93632]" />
                )}
            </div>

            {error ? (
                <p
                    className="rounded-[6px] border border-[#D99A8B] bg-[#FFF0EC] px-3 py-2 text-sm font-semibold text-[#8A2E21]"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}

            {elements.length > 0 ? (
                <div className="grid gap-4">
                    {elements.map((element) => (
                        <label className="grid gap-2 text-sm font-semibold text-[#1F150A]" key={element.id}>
                            <span className="capitalize">{element.label}</span>
                            <textarea
                                className="min-h-28 resize-y rounded-[6px] border border-[#CBA980] bg-white p-3 text-sm font-normal leading-6 text-[#1F150A] outline-none transition focus:border-[#D93632] focus:ring-2 focus:ring-[#D9363226] disabled:opacity-65"
                                disabled={disabled}
                                maxLength={element.maxLength}
                                onChange={(event) => onChangeText(element, event.target.value)}
                                value={element.value}
                            />
                            <span className="text-right text-xs text-[#6F5A4A]">
                                {element.value.length}/{element.maxLength}
                            </span>
                        </label>
                    ))}
                </div>
            ) : (
                <p className="rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
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
