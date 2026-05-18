import { EyeOff, Lock, Palette, Type } from 'lucide-react';
import type { ReactNode } from 'react';

import type { CanvasElement } from '../../../../domain/canvas/schema';
import {
    elementLabel,
    isElementHidden,
    isElementLocked,
    isTextEditableElement,
    isTransformableElement,
    styleNumber,
    styleString,
    textValueForElement,
    type ElementPatch,
} from './canvasTransformUtils';
import { LayerControls } from './LayerControls';
import type { LayerAction } from './layerUtils';

type ElementPropertiesPanelProps = {
    disabled: boolean;
    element: CanvasElement | null;
    maxTextLength: number;
    onChangeText: (element: CanvasElement, value: string) => void;
    onLayerAction: (action: LayerAction) => void;
    onPatchElement: (patch: ElementPatch) => void;
    onPatchStyle: (stylePatch: Record<string, unknown>) => void;
};

type NumberField = 'x' | 'y' | 'w' | 'h' | 'rotation' | 'z';

export function ElementPropertiesPanel({
    disabled,
    element,
    maxTextLength,
    onChangeText,
    onLayerAction,
    onPatchElement,
    onPatchStyle,
}: ElementPropertiesPanelProps) {
    if (!element) {
        return (
            <section className="mb-4 rounded-[8px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
                Selecione um texto, imagem ou adesivo na página.
            </section>
        );
    }

    const elementLocked = isElementLocked(element);
    const hidden = isElementHidden(element);
    const locked = disabled || elementLocked || hidden;
    const label = elementLabel(element);

    return (
        <section className="mb-4 grid min-w-0 gap-4 overflow-hidden rounded-[8px] border border-[#D8B991] bg-[#FFFBF6] p-3 text-[#1F150A]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-[#7A2634]">Item selecionado</p>
                    <h2 className="mt-1 truncate text-base font-semibold">{label}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase text-[#6F5A4A]">{typeLabel(element.type)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {hidden ? <EyeOff aria-hidden="true" className="h-4 w-4 text-[#7A5A43]" /> : null}
                    {disabled || elementLocked ? <Lock aria-hidden="true" className="h-4 w-4 text-[#7A5A43]" /> : null}
                </div>
            </div>

            {hidden ? (
                <p className="rounded-[6px] border border-[#D8B991] bg-white px-3 py-2 text-sm font-semibold text-[#6F5A4A]">
                    Item oculto.
                </p>
            ) : null}

            {elementLocked ? (
                <p className="rounded-[6px] border border-[#D8B991] bg-white px-3 py-2 text-sm font-semibold text-[#6F5A4A]">
                    Item bloqueado. Desbloqueie em Camadas para editar.
                </p>
            ) : null}

            {isTransformableElement(element) ? (
                <>
                    <div className="grid min-w-0 gap-3">
                        <FieldGroup title="Posição">
                            <NumberInput
                                disabled={locked}
                                label="Horizontal"
                                onChange={(value) => patchNumber('x', value)}
                                value={element.x}
                            />
                            <NumberInput
                                disabled={locked}
                                label="Vertical"
                                onChange={(value) => patchNumber('y', value)}
                                value={element.y}
                            />
                        </FieldGroup>
                        <FieldGroup title="Tamanho">
                            <NumberInput
                                disabled={locked}
                                label="Largura"
                                onChange={(value) => patchNumber('w', value)}
                                value={element.w}
                            />
                            <NumberInput
                                disabled={locked}
                                label="Altura"
                                onChange={(value) => patchNumber('h', value)}
                                value={element.h}
                            />
                        </FieldGroup>
                        <FieldGroup title="Transformação">
                            <NumberInput
                                disabled={locked}
                                label="Rotação"
                                onChange={(value) => patchNumber('rotation', value)}
                                value={element.rotation}
                            />
                            <NumberInput
                                disabled={locked}
                                label="Camada"
                                onChange={(value) => patchNumber('z', value)}
                                value={element.z}
                            />
                        </FieldGroup>
                    </div>

                    <div className="grid gap-2">
                        <p className="text-xs font-semibold uppercase text-[#7A2634]">Camadas</p>
                        <LayerControls disabled={locked} onAction={onLayerAction} />
                    </div>

                    {isTextEditableElement(element) ? (
                        <TextControls
                            disabled={locked}
                            element={element}
                            maxTextLength={maxTextLength}
                            onChangeText={onChangeText}
                            onPatchStyle={onPatchStyle}
                        />
                    ) : null}
                </>
            ) : (
                <p className="rounded-[6px] border border-[#D8B991] bg-white px-3 py-2 text-sm font-semibold text-[#6F5A4A]">
                    Item preservado.
                </p>
            )}
        </section>
    );

    function patchNumber(field: NumberField, value: number) {
        onPatchElement({ [field]: value });
    }
}

type TextControlsProps = {
    disabled: boolean;
    element: CanvasElement;
    maxTextLength: number;
    onChangeText: (element: CanvasElement, value: string) => void;
    onPatchStyle: (stylePatch: Record<string, unknown>) => void;
};

function TextControls({ disabled, element, maxTextLength, onChangeText, onPatchStyle }: TextControlsProps) {
    const value = textValueForElement(element);
    const fontSize = styleNumber(element, 'fontSize') ?? 54;
    const color = colorInputValue(styleString(element, 'color'));
    const align = styleString(element, 'align') ?? 'left';

    return (
        <div className="grid min-w-0 gap-3">
            <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                <span className="inline-flex items-center gap-2">
                    <Type aria-hidden="true" className="h-4 w-4 text-[#7A2634]" />
                    {element.type === 'sticker' ? 'Texto do adesivo' : 'Texto'}
                </span>
                <textarea
                    className="min-h-24 w-full min-w-0 resize-y rounded-[6px] border border-[#CBA980] bg-white p-3 text-sm font-normal leading-6 text-[#1F150A] outline-none transition focus:border-[#D93632] focus:ring-2 focus:ring-[#D9363226] disabled:opacity-65"
                    disabled={disabled}
                    maxLength={maxTextLength}
                    onChange={(event) => onChangeText(element, event.target.value)}
                    value={value}
                />
                <span className="text-right text-xs text-[#6F5A4A]">
                    {value.length}/{maxTextLength}
                </span>
            </label>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_72px]">
                <NumberInput
                    disabled={disabled}
                    label="Tamanho"
                    min={8}
                    onChange={(nextValue) => onPatchStyle({ fontSize: nextValue })}
                    value={fontSize}
                />
                <label className="grid min-w-0 gap-1 text-xs font-semibold uppercase text-[#6F5A4A]">
                    <span>Cor</span>
                    <span className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#CBA980] bg-white px-2">
                        <Palette aria-hidden="true" className="mr-2 h-4 w-4 text-[#7A2634]" />
                        <input
                            aria-label="Cor do texto"
                            className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                            disabled={disabled}
                            onChange={(event) => onPatchStyle({ color: event.target.value })}
                            type="color"
                            value={color}
                        />
                    </span>
                </label>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                {(['left', 'center', 'right'] as const).map((value) => (
                    <button
                        className={`min-h-9 rounded-[6px] border px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            align === value
                                ? 'border-[#7A2634] bg-[#FFF0EC] text-[#7A2634]'
                                : 'border-[#CBA980] bg-white text-[#42291D] hover:bg-[#F6E4CF]'
                        }`}
                        disabled={disabled}
                        key={value}
                        onClick={() => onPatchStyle({ align: value })}
                        type="button"
                    >
                        {alignLabel(value)}
                    </button>
                ))}
            </div>
        </div>
    );
}

type NumberInputProps = {
    disabled: boolean;
    label: string;
    min?: number;
    onChange: (value: number) => void;
    value: number;
};

function NumberInput({ disabled, label, min, onChange, value }: NumberInputProps) {
    return (
        <label className="grid min-w-0 gap-1 text-xs font-semibold uppercase text-[#6F5A4A]">
            <span>{label}</span>
            <input
                className="h-10 w-full min-w-0 rounded-[6px] border border-[#CBA980] bg-white px-2 text-sm font-semibold text-[#1F150A] outline-none transition focus:border-[#D93632] focus:ring-2 focus:ring-[#D9363226] disabled:opacity-65"
                disabled={disabled}
                inputMode="decimal"
                min={min}
                onChange={(event) => {
                    const next = Number(event.target.value);

                    if (Number.isFinite(next)) {
                        onChange(next);
                    }
                }}
                step="1"
                type="number"
                value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
            />
        </label>
    );
}

type FieldGroupProps = {
    children: ReactNode;
    title: string;
};

function FieldGroup({ children, title }: FieldGroupProps) {
    return (
        <div className="grid min-w-0 gap-2">
            <p className="text-xs font-semibold uppercase text-[#7A2634]">{title}</p>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
        </div>
    );
}

function typeLabel(type: string): string {
    if (type === 'text') {
        return 'Texto';
    }

    if (type === 'image') {
        return 'Imagem';
    }

    if (type === 'sticker') {
        return 'Adesivo';
    }

    return 'Item';
}

function colorInputValue(color: string | null): string {
    return color && /^#[0-9a-f]{6}$/i.test(color) ? color : '#3A2418';
}

function alignLabel(value: 'left' | 'center' | 'right'): string {
    if (value === 'center') {
        return 'Centro';
    }

    if (value === 'right') {
        return 'Direita';
    }

    return 'Esquerda';
}
