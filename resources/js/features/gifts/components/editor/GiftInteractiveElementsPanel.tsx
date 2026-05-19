import { Image as ImageIcon, MailOpen } from 'lucide-react';

type InteractiveElementKind = 'interactive_envelope' | 'flip_polaroid';

type GiftInteractiveElementsPanelProps = {
    disabled: boolean;
    onAddElement: (kind: InteractiveElementKind) => void;
    saveStatus: string;
};

const ELEMENTS: Array<{
    detail: string;
    icon: typeof MailOpen;
    kind: InteractiveElementKind;
    title: string;
}> = [
    {
        kind: 'interactive_envelope',
        title: 'Envelope com carta',
        detail: 'Carta dobrável',
        icon: MailOpen,
    },
    {
        kind: 'flip_polaroid',
        title: 'Polaroid virável',
        detail: 'Frente e verso',
        icon: ImageIcon,
    },
];

export function GiftInteractiveElementsPanel({ disabled, onAddElement, saveStatus }: GiftInteractiveElementsPanelProps) {
    return (
        <section className="grid gap-3 text-[#1F150A]">
            <div>
                <h2 className="text-sm font-semibold uppercase text-[#7A2634]">Elementos</h2>
            </div>

            <div className="grid gap-2">
                {ELEMENTS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            className="grid min-h-24 grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-[8px] border border-[#D8B991] bg-[#FFFBF6] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#7A2634] hover:bg-[#FFF0EC] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            disabled={disabled}
                            key={item.kind}
                            onClick={() => onAddElement(item.kind)}
                            type="button"
                        >
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[7px] border border-[#CBA980] bg-white text-[#7A2634]">
                                <Icon aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold text-[#1F150A]">{item.title}</span>
                                <span className="mt-1 block text-xs font-medium leading-5 text-[#6F5A4A]">
                                    {item.detail}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="text-xs font-semibold uppercase text-[#6F5A4A]">
                {saveStatus === 'saving' ? 'Salvando página' : 'Entra no centro da página'}
            </p>
        </section>
    );
}

export type { InteractiveElementKind };
