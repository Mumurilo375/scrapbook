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
        <div className="grid grid-cols-4 gap-1.5">
            {ACTIONS.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        aria-label={item.label}
                        className="inline-flex h-10 items-center justify-center rounded-[5px] border border-[#978E9C] bg-white text-[#342E38] outline-none transition hover:border-[#21162D] hover:bg-[#EFEBF3] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#746D78] disabled:opacity-60"
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
