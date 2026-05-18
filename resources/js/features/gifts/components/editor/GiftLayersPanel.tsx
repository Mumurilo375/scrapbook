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
        <section className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-[#1F150A]">Camadas</h2>
                    <p className="mt-1 text-sm text-[#6F5A4A]">{elementCountLabel(elements.length)}</p>
                </div>
                <Layers aria-hidden="true" className="h-4 w-4 text-[#7A2634]" />
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
                <p className="rounded-[6px] border border-dashed border-[#CBA980] bg-[#FFFBF6] p-3 text-sm text-[#6F5A4A]">
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
            className={`grid gap-2 rounded-[6px] border p-2 transition ${
                selected
                    ? 'border-[#7A2634] bg-[#FFF0EC] text-[#7A2634]'
                    : hidden
                      ? 'border-[#D8B991] bg-white/70 text-[#6F5A4A]'
                      : 'border-[#D8B991] bg-white text-[#42291D] hover:bg-[#FFF8EF]'
            }`}
        >
            <div className="flex min-w-0 items-start gap-2">
                <button
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-[5px] px-1.5 text-left outline-none transition hover:bg-[#FFF8EF] focus-visible:ring-2 focus-visible:ring-[#D9363226]"
                    onClick={() => onSelectElement(element.id)}
                    type="button"
                >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-[#F6E7D6] text-[#7A2634]">
                        <LayerTypeIcon type={element.type} />
                    </span>
                    <span className="min-w-0">
                        <span className={`block truncate text-sm font-semibold ${hidden ? 'opacity-70' : ''}`}>
                            {label}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase text-[#6F5A4A]">
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
                className="h-9 min-w-0 rounded-[6px] border border-[#D8B991] bg-[#FFFBF6] px-2 text-sm font-semibold text-[#1F150A] outline-none transition placeholder:text-[#9B7B62] focus:border-[#D93632] focus:ring-2 focus:ring-[#D9363226] disabled:opacity-60"
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
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[6px] border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                danger
                    ? 'border-[#D99A8B] bg-[#FFF0EC] text-[#8A2E21] hover:bg-[#F9DDD6]'
                    : 'border-[#CBA980] bg-[#FFF8EF] text-[#42291D] hover:bg-[#F6E4CF]'
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
