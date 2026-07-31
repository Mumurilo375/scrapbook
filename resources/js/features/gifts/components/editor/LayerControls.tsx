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
        <div className="grid grid-cols-4 divide-x divide-[#D8D2DE] border-y border-[#D8D2DE]">
            {ACTIONS.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        aria-label={item.label}
                        className="inline-flex h-11 items-center justify-center bg-white text-[#342E38] outline-none transition-colors hover:bg-[#EFEBF3] focus-visible:z-10 focus-visible:bg-[#FFF2EF] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:text-[#978E9C]"
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
