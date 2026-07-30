import { Copy, Eye, EyeOff, ImageIcon, Layers, Lock, LockOpen, Music, Sparkles, Trash2, Type } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';

import type { RendererAssetMap } from '../../../../components/renderer';
import type { Canvas, CanvasElement } from '../../../../domain/canvas/schema';
import { isTransformableElement } from './canvasTransformUtils';
import { LayerControls } from './LayerControls';
import {
    getLayerName,
    getLayerTypeLabel,
    isElementHidden,
    isElementLocked,
    sortElementsByLayer,
    type LayerAction,
} from './layerUtils';

type GiftLayersPanelProps = {
    assets?: RendererAssetMap;
    canvas: Canvas | null;
    disabled: boolean;
    onDeleteElement: (elementId: string) => void;
    onDuplicateElement: (elementId: string) => void;
    onLayerAction: (action: LayerAction) => void;
    onRenameElement: (elementId: string, name: string) => void;
    onSelectElement: (elementId: string) => void;
    onToggleHidden: (elementId: string) => void;
    onToggleLocked: (elementId: string) => void;
    selectedElementId: string | null;
};

export function GiftLayersPanel({
    assets,
    canvas,
    disabled,
    onDeleteElement,
    onDuplicateElement,
    onLayerAction,
    onRenameElement,
    onSelectElement,
    onToggleHidden,
    onToggleLocked,
    selectedElementId,
}: GiftLayersPanelProps) {
    const elements = useMemo(() => (canvas ? sortElementsByLayer(canvas).reverse() : []), [canvas]);
    const selectedElement = elements.find((element) => element.id === selectedElementId) ?? null;
    const layerControlsDisabled =
        disabled ||
        !selectedElement ||
        !isTransformableElement(selectedElement) ||
        isElementLocked(selectedElement) ||
        isElementHidden(selectedElement);

    return (
        <section className="grid gap-4 text-[#342E38]">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">Camadas</h2>
                    <p className="mt-1 text-sm text-[#746D78]">{elementCountLabel(elements.length)}</p>
                </div>
                <Layers aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#FF765B]" />
            </div>

            <LayerControls disabled={layerControlsDisabled} onAction={onLayerAction} />

            {elements.length > 0 ? (
                <div className="grid gap-2">
                    {elements.map((element) => (
                        <LayerRow
                            assets={assets}
                            disabled={disabled}
                            element={element}
                            key={element.id}
                            onDeleteElement={onDeleteElement}
                            onDuplicateElement={onDuplicateElement}
                            onRenameElement={onRenameElement}
                            onSelectElement={onSelectElement}
                            onToggleHidden={onToggleHidden}
                            onToggleLocked={onToggleLocked}
                            selected={element.id === selectedElementId}
                        />
                    ))}
                </div>
            ) : (
                <p className="rounded-[6px] border border-dashed border-[#C9C1CD] bg-[#EFEBF3] p-4 text-sm text-[#342E38]">
                    Esta página ainda não possui itens editáveis.
                </p>
            )}
        </section>
    );
}

type LayerRowProps = {
    assets?: RendererAssetMap;
    disabled: boolean;
    element: CanvasElement;
    onDeleteElement: (elementId: string) => void;
    onDuplicateElement: (elementId: string) => void;
    onRenameElement: (elementId: string, name: string) => void;
    onSelectElement: (elementId: string) => void;
    onToggleHidden: (elementId: string) => void;
    onToggleLocked: (elementId: string) => void;
    selected: boolean;
};

function LayerRow({
    assets,
    disabled,
    element,
    onDeleteElement,
    onDuplicateElement,
    onRenameElement,
    onSelectElement,
    onToggleHidden,
    onToggleLocked,
    selected,
}: LayerRowProps) {
    const hidden = isElementHidden(element);
    const locked = isElementLocked(element);
    const label = getLayerName(element, assets);
    const customName = typeof element.name === 'string' ? element.name : '';

    return (
        <div
            className={`grid gap-2 rounded-[7px] border p-2 transition ${
                selected
                    ? 'border-[#C94F39] bg-[#FFF2EF] text-[#21162D]'
                    : hidden
                      ? 'border-[#C9C1CD] bg-[#EFEBF3] text-[#342E38]'
                      : 'border-[#C9C1CD] bg-white text-[#342E38] hover:border-[#AAA1AF] hover:bg-[#F8F6FA]'
            }`}
        >
            <div className="flex min-w-0 items-start gap-2">
                <button
                    className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-[5px] px-1 text-left outline-none transition hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-1"
                    onClick={() => onSelectElement(element.id)}
                    type="button"
                >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#EFEBF3] text-[#21162D]">
                        <LayerTypeIcon type={element.type} />
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{label}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#645D68]">
                            {getLayerTypeLabel(element.type)}
                            {locked ? (
                                <span className="inline-flex items-center gap-1" title="Bloqueado">
                                    <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                                    Bloqueado
                                </span>
                            ) : null}
                            {hidden ? (
                                <span className="inline-flex items-center gap-1" title="Oculto">
                                    <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                                    Oculto
                                </span>
                            ) : null}
                        </span>
                    </span>
                </button>
                <div className="grid shrink-0 grid-cols-4 gap-1">
                    <IconButton
                        disabled={disabled}
                        label={hidden ? 'Exibir elemento' : 'Ocultar elemento'}
                        onClick={() => onToggleHidden(element.id)}
                    >
                        {hidden ? (
                            <Eye aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <EyeOff aria-hidden="true" className="h-4 w-4" />
                        )}
                    </IconButton>
                    <IconButton
                        disabled={disabled}
                        label={locked ? 'Desbloquear elemento' : 'Bloquear elemento'}
                        onClick={() => onToggleLocked(element.id)}
                    >
                        {locked ? (
                            <LockOpen aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <Lock aria-hidden="true" className="h-4 w-4" />
                        )}
                    </IconButton>
                    <IconButton
                        disabled={disabled || locked || hidden}
                        label="Duplicar item"
                        onClick={() => onDuplicateElement(element.id)}
                    >
                        <Copy aria-hidden="true" className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                        danger
                        disabled={disabled || locked}
                        label="Excluir item"
                        onClick={() => onDeleteElement(element.id)}
                    >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </IconButton>
                </div>
            </div>
            <label className="sr-only" htmlFor={`layer-name-${element.id}`}>
                Nome da camada
            </label>
            <input
                className="h-10 min-w-0 rounded-[5px] border border-[#978E9C] bg-white px-2 text-sm font-semibold text-[#342E38] outline-none transition placeholder:text-[#746D78] focus:border-[#21162D] focus:ring-2 focus:ring-[#FF765B66] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78]"
                defaultValue={customName}
                disabled={disabled}
                id={`layer-name-${element.id}`}
                maxLength={80}
                onBlur={(event) => onRenameElement(element.id, event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.currentTarget.blur();
                    }
                }}
                placeholder={label}
            />
        </div>
    );
}

type IconButtonProps = {
    children: ReactNode;
    className?: string;
    danger?: boolean;
    disabled: boolean;
    label: string;
    onClick: () => void;
};

function IconButton({ children, className = '', danger = false, disabled, label, onClick }: IconButtonProps) {
    return (
        <button
            aria-label={label}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[5px] border outline-none transition focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:border-[#C9C1CD] disabled:bg-[#EFEBF3] disabled:text-[#746D78] disabled:opacity-60 ${
                danger
                    ? 'border-[#C85B47] bg-[#FFF2EF] text-[#7C3024] hover:border-[#7C3024] hover:bg-[#FFE5DF]'
                    : 'border-[#978E9C] bg-white text-[#342E38] hover:border-[#21162D] hover:bg-[#EFEBF3]'
            } ${className}`}
            disabled={disabled}
            onClick={onClick}
            title={label}
            type="button"
        >
            {children}
        </button>
    );
}

function LayerTypeIcon({ type }: { type: string }) {
    if (type === 'text') {
        return <Type aria-hidden="true" className="h-4 w-4" />;
    }

    if (type === 'image') {
        return <ImageIcon aria-hidden="true" className="h-4 w-4" />;
    }

    if (type === 'sticker') {
        return <Sparkles aria-hidden="true" className="h-4 w-4" />;
    }

    if (type === 'music') {
        return <Music aria-hidden="true" className="h-4 w-4" />;
    }

    return <Layers aria-hidden="true" className="h-4 w-4" />;
}

function elementCountLabel(count: number): string {
    if (count === 0) {
        return 'Nenhum item na página';
    }

    if (count === 1) {
        return '1 item na página';
    }

    return `${count} itens na página`;
}
