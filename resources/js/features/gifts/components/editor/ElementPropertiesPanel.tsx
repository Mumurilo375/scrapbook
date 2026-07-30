import { EyeOff, Image as ImageIcon, Lock, Mail, Palette, Rotate3D, Type } from 'lucide-react';
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
    onReplacePhoto?: (element: CanvasElement) => void;
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
    onReplacePhoto,
}: ElementPropertiesPanelProps) {
    if (!element) {
        return (
            <section className="mb-5 rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm text-[#342E38]">
                Selecione um texto, imagem ou adesivo na página.
            </section>
        );
    }

    const elementLocked = isElementLocked(element);
    const hidden = isElementHidden(element);
    const locked = disabled || elementLocked || hidden;
    const label = elementLabel(element);

    return (
        <section className="mb-5 grid min-w-0 gap-4 overflow-hidden border-b border-[#C9C1CD] pb-5 text-[#342E38]">
            <div className="flex items-start justify-between gap-3 rounded-[7px] bg-[#21162D] px-3 py-2.5 text-white">
                <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-[0.04em] text-[#FF9A86] uppercase">Item selecionado</p>
                    <h2 className="font-display mt-1 truncate text-base font-bold tracking-[-0.02em]">{label}</h2>
                    <p className="mt-0.5 text-xs font-semibold text-[#D8D2DE]">{typeLabel(element.type)}</p>
                </div>
                <div className="mt-1 flex shrink-0 items-center gap-2 text-[#D8D2DE]">
                    {hidden ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : null}
                    {disabled || elementLocked ? <Lock aria-hidden="true" className="h-4 w-4" /> : null}
                </div>
            </div>

            {hidden ? (
                <p className="rounded-[6px] border border-[#C9C1CD] bg-[#EFEBF3] px-3 py-2 text-sm font-semibold text-[#342E38]">
                    Item oculto.
                </p>
            ) : null}

            {elementLocked ? (
                <p className="rounded-[6px] border border-[#C9C1CD] bg-[#EFEBF3] px-3 py-2 text-sm font-semibold text-[#342E38]">
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
                        <p className="text-xs font-bold text-[#21162D]">Ordem da camada</p>
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

                    {element.type === 'interactive_envelope' ? (
                        <EnvelopeControls disabled={locked} element={element} onPatchElement={onPatchElement} />
                    ) : null}

                    {element.type === 'flip_polaroid' ? (
                        <PolaroidControls
                            disabled={locked}
                            element={element}
                            onPatchElement={onPatchElement}
                            onReplacePhoto={onReplacePhoto}
                        />
                    ) : null}
                </>
            ) : (
                <p className="rounded-[6px] border border-[#C9C1CD] bg-[#EFEBF3] px-3 py-2 text-sm font-semibold text-[#342E38]">
                    Item preservado.
                </p>
            )}
        </section>
    );

    function patchNumber(field: NumberField, value: number) {
        onPatchElement({ [field]: value });
    }
}

type EnvelopeControlsProps = {
    disabled: boolean;
    element: CanvasElement;
    onPatchElement: (patch: ElementPatch) => void;
};

function EnvelopeControls({ disabled, element, onPatchElement }: EnvelopeControlsProps) {
    const record = element as CanvasElement & Record<string, unknown>;
    const elementStyle = isRecord(record.style) ? record.style : {};
    const title = typeof record.title === 'string' ? record.title : '';
    const content = typeof record.content === 'string' ? record.content : '';
    const variant = typeof elementStyle.variant === 'string' ? elementStyle.variant : 'kraft';

    return (
        <div className="grid min-w-0 gap-3">
            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span className="inline-flex items-center gap-2">
                    <Mail aria-hidden="true" className="h-4 w-4 text-[#FF765B]" />
                    Título do envelope
                </span>
                <input
                    className="h-10 w-full min-w-0 rounded-[6px] border border-[#978E9C] bg-white px-3 text-sm font-normal text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={120}
                    onChange={(event) => onPatchElement({ title: event.target.value })}
                    value={title}
                />
                <span className="text-right text-xs font-medium text-[#746D78]">{title.length}/120</span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span>Conteúdo da carta</span>
                <textarea
                    className="min-h-32 w-full min-w-0 resize-y rounded-[6px] border border-[#978E9C] bg-white p-3 text-sm font-normal leading-6 text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={1000}
                    onChange={(event) => onPatchElement({ content: event.target.value })}
                    value={content}
                />
                <span className="text-right text-xs font-medium text-[#746D78]">{content.length}/1000</span>
            </label>

            <label className="grid gap-1.5 text-xs font-bold text-[#342E38]">
                <span>Estilo</span>
                <select
                    className="h-10 rounded-[6px] border border-[#978E9C] bg-white px-3 text-sm font-semibold text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    onChange={(event) => onPatchElement({ style: { ...elementStyle, variant: event.target.value } })}
                    value={variant}
                >
                    <option value="kraft">Kraft</option>
                    <option value="cream">Creme</option>
                    <option value="rose">Rosado</option>
                </select>
            </label>
        </div>
    );
}

type PolaroidControlsProps = {
    disabled: boolean;
    element: CanvasElement;
    onPatchElement: (patch: ElementPatch) => void;
    onReplacePhoto?: (element: CanvasElement) => void;
};

function PolaroidControls({ disabled, element, onPatchElement, onReplacePhoto }: PolaroidControlsProps) {
    const record = element as CanvasElement & Record<string, unknown>;
    const front = isRecord(record.front) ? record.front : {};
    const back = isRecord(record.back) ? record.back : {};
    const caption = typeof front.caption === 'string' ? front.caption : '';
    const placeholderLabel = typeof front.placeholderLabel === 'string' ? front.placeholderLabel : '';
    const backText = typeof back.text === 'string' ? back.text : '';
    const hasPhoto = typeof front.mediaItemId === 'string' && front.mediaItemId.trim() !== '';

    return (
        <div className="grid min-w-0 gap-3">
            <div className="grid gap-2 rounded-[6px] border border-[#C9C1CD] bg-[#EFEBF3] p-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#21162D]">
                        <ImageIcon aria-hidden="true" className="h-4 w-4 text-[#FF765B]" />
                        Foto da frente
                    </span>
                    <span className="text-xs font-semibold text-[#645D68]">
                        {hasPhoto ? 'Com foto' : 'Placeholder'}
                    </span>
                </div>
                {onReplacePhoto ? (
                    <button
                        className="min-h-10 rounded-[6px] border border-[#C94F39] bg-[#FF765B] px-3 text-sm font-bold text-[#21162D] outline-none transition hover:border-[#21162D] hover:bg-[#FF8B74] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[#C9C1CD] disabled:bg-[#E1DCE5] disabled:text-[#746D78]"
                        disabled={disabled}
                        onClick={() => onReplacePhoto(element)}
                        type="button"
                    >
                        Trocar foto
                    </button>
                ) : null}
            </div>

            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span>Legenda da frente</span>
                <input
                    className="h-10 w-full min-w-0 rounded-[6px] border border-[#978E9C] bg-white px-3 text-sm font-normal text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={120}
                    onChange={(event) => onPatchElement({ front: { ...front, caption: event.target.value } })}
                    value={caption}
                />
                <span className="text-right text-xs font-medium text-[#746D78]">{caption.length}/120</span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span>Placeholder sem foto</span>
                <input
                    className="h-10 w-full min-w-0 rounded-[6px] border border-[#978E9C] bg-white px-3 text-sm font-normal text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={120}
                    onChange={(event) => onPatchElement({ front: { ...front, placeholderLabel: event.target.value } })}
                    value={placeholderLabel}
                />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span className="inline-flex items-center gap-2">
                    <Rotate3D aria-hidden="true" className="h-4 w-4 text-[#FF765B]" />
                    Texto do verso
                </span>
                <textarea
                    className="min-h-28 w-full min-w-0 resize-y rounded-[6px] border border-[#978E9C] bg-white p-3 text-sm font-normal leading-6 text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={500}
                    onChange={(event) => onPatchElement({ back: { ...back, text: event.target.value } })}
                    value={backText}
                />
                <span className="text-right text-xs font-medium text-[#746D78]">{backText.length}/500</span>
            </label>
        </div>
    );
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
            <label className="grid gap-2 text-sm font-semibold text-[#342E38]">
                <span className="inline-flex items-center gap-2">
                    <Type aria-hidden="true" className="h-4 w-4 text-[#FF765B]" />
                    {element.type === 'sticker' ? 'Texto do adesivo' : 'Texto'}
                </span>
                <textarea
                    className="min-h-24 w-full min-w-0 resize-y rounded-[6px] border border-[#978E9C] bg-white p-3 text-sm font-normal leading-6 text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                    disabled={disabled}
                    maxLength={maxTextLength}
                    onChange={(event) => onChangeText(element, event.target.value)}
                    value={value}
                />
                <span className="text-right text-xs font-medium text-[#746D78]">
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
                <label className="grid min-w-0 gap-1.5 text-xs font-bold text-[#342E38]">
                    <span>Cor</span>
                    <span className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#978E9C] bg-white px-2">
                        <Palette aria-hidden="true" className="mr-2 h-4 w-4 text-[#FF765B]" />
                        <input
                            aria-label="Cor do texto"
                            className="h-7 w-7 cursor-pointer rounded-[3px] border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#21162D] disabled:cursor-not-allowed"
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
                        className={`min-h-10 rounded-[5px] border px-2 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-[#C9C1CD] disabled:bg-[#EFEBF3] disabled:text-[#746D78] disabled:opacity-60 ${
                            align === value
                                ? 'border-[#C94F39] bg-[#FF765B] text-[#21162D]'
                                : 'border-[#978E9C] bg-white text-[#342E38] hover:border-[#21162D] hover:bg-[#EFEBF3]'
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
        <label className="grid min-w-0 gap-1.5 text-xs font-bold text-[#342E38]">
            <span>{label}</span>
            <input
                className="h-10 w-full min-w-0 rounded-[6px] border border-[#978E9C] bg-white px-2 text-sm font-semibold text-[#342E38] outline-none transition focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
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
        <div className="grid min-w-0 gap-2 border-t border-[#D8D2DE] pt-3">
            <p className="text-xs font-bold text-[#21162D]">{title}</p>
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

    if (type === 'interactive_envelope') {
        return 'Envelope com carta';
    }

    if (type === 'flip_polaroid') {
        return 'Polaroid virável';
    }

    return 'Item';
}

function colorInputValue(color: string | null): string {
    return color && /^#[0-9a-f]{6}$/i.test(color) ? color : '#342E38';
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
