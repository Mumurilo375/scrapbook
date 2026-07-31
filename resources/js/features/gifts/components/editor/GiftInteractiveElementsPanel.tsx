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
        <section className="gift-editor-inspector-section grid text-[#342E38]" data-save-status={saveStatus}>
            <header className="border-b border-[#D8D2DE] pb-4">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-[#21162D]">
                    Elementos interativos
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-[#746D78]">
                    Acrescente surpresas que a pessoa pode abrir e virar.
                </p>
            </header>

            <ul className="divide-y divide-[#D8D2DE] border-b border-[#D8D2DE]">
                {ELEMENTS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.kind}>
                            <button
                                className="group grid min-h-16 w-full grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-1 py-2.5 text-left outline-none transition-colors hover:bg-[#F8F6FA] focus-visible:bg-[#FFF2EF] disabled:cursor-not-allowed disabled:bg-[#EFEBF3] disabled:opacity-60"
                                disabled={disabled}
                                onClick={() => onAddElement(item.kind)}
                                type="button"
                            >
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#EFEBF3] text-[#21162D] transition-colors group-hover:bg-[#FFE0D9]">
                                    <Icon aria-hidden="true" className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-bold text-[#21162D]">{item.title}</span>
                                    <span className="mt-0.5 block text-xs font-medium leading-5 text-[#746D78]">
                                        {item.detail}
                                    </span>
                                </span>
                                <span aria-hidden="true" className="text-lg leading-none text-[#978E9C]">
                                    +
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <p className="pt-3 text-xs font-semibold text-[#746D78]">
                {saveStatus === 'saving' ? 'Salvando página' : 'Entra no centro da página'}
            </p>
        </section>
    );
}

export type { InteractiveElementKind };
