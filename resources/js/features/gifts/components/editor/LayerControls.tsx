import { ChevronsDown, ChevronsUp, MoveDown, MoveUp } from 'lucide-react';

import type { LayerAction } from './layerUtils';

type LayerControlsProps = {
    disabled: boolean;
    onAction: (action: LayerAction) => void;
};

const ACTIONS: Array<{ action: LayerAction; icon: typeof ChevronsUp; label: string }> = [
    { action: 'bring-front', icon: ChevronsUp, label: 'Trazer para frente' },
    { action: 'forward', icon: MoveUp, label: 'Mover uma camada acima' },
    { action: 'backward', icon: MoveDown, label: 'Mover uma camada abaixo' },
    { action: 'send-back', icon: ChevronsDown, label: 'Enviar para trás' },
];

export function LayerControls({ disabled, onAction }: LayerControlsProps) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {ACTIONS.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        aria-label={item.label}
                        className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#CBA980] bg-[#FFF8EF] text-[#42291D] transition hover:bg-[#F6E4CF] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled}
                        key={item.action}
                        onClick={() => onAction(item.action)}
                        title={item.label}
                        type="button"
                    >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                    </button>
                );
            })}
        </div>
    );
}
