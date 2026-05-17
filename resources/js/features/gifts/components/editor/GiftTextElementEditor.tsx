import { Lock, Type } from 'lucide-react';

import type { EditableTextElement } from './editorTypes';

type GiftTextElementEditorProps = {
    disabled: boolean;
    elements: EditableTextElement[];
    onChangeText: (element: EditableTextElement, value: string) => void;
};

export function GiftTextElementEditor({ disabled, elements, onChangeText }: GiftTextElementEditorProps) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Textos da página</h2>
                    <p className="mt-1 text-xs text-[#6F5A4A]">{elements.length} campos editáveis</p>
                </div>
                {disabled ? <Lock aria-hidden="true" className="h-4 w-4 text-[#7A5A43]" /> : <Type aria-hidden="true" className="h-4 w-4 text-[#D93632]" />}
            </div>

            {elements.length > 0 ? (
                <div className="mt-4 grid gap-4">
                    {elements.map((element) => (
                        <label className="grid gap-2 text-sm font-semibold text-[#1F150A]" key={element.id}>
                            {element.label}
                            <textarea
                                className="min-h-28 resize-y rounded-[6px] border border-[#CBA980] bg-white p-3 text-sm font-normal leading-6 text-[#1F150A] outline-none focus:border-[#D93632] disabled:opacity-65"
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
                <p className="mt-4 rounded-[6px] border border-dashed border-[#CBA980] bg-white p-3 text-sm text-[#6F5A4A]">
                    Esta página não possui elementos de texto editáveis neste MVP.
                </p>
            )}
        </section>
    );
}
