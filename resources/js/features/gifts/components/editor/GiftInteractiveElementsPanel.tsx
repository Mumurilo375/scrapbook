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

export function GiftInteractiveElementsPanel({
    disabled,
    onAddElement,
    saveStatus,
}: GiftInteractiveElementsPanelProps) {
    return (
        <section className="grid gap-4 text-[#342E38]">
            <div>
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">
                    Elementos interativos
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-[#746D78]">
                    Acrescente surpresas que a pessoa pode abrir e virar.
                </p>
            </div>

            <div className="grid gap-2">
                {ELEMENTS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            className="group grid min-h-20 grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-[7px] border border-[#978E9C] bg-white p-3 text-left outline-none transition hover:border-[#21162D] hover:bg-[#F8F6FA] focus-visible:ring-2 focus-visible:ring-[#21162D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:opacity-60"
                            disabled={disabled}
                            key={item.kind}
                            onClick={() => onAddElement(item.kind)}
                            type="button"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#EFEBF3] text-[#21162D] transition group-hover:bg-[#FF765B]">
                                <Icon aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                                <span className="block text-sm font-bold text-[#21162D]">{item.title}</span>
                                <span className="mt-0.5 block text-xs font-medium leading-5 text-[#746D78]">
                                    {item.detail}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <p className="text-xs font-semibold text-[#746D78]">
                {saveStatus === 'saving' ? 'Salvando página' : 'Entra no centro da página'}
            </p>
        </section>
    );
}

export type { InteractiveElementKind };
