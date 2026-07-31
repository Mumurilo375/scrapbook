import { Camera, Heart, Mail, Music } from 'lucide-react';

type PhoneMockupProps = {
    compact?: boolean;
};

export function PhoneMockup({ compact = false }: PhoneMockupProps) {
    return (
        <div
            className={`mx-auto rounded-[2rem] border-[10px] border-[#181024] bg-[#181024] shadow-[0_28px_54px_#18102442] ${compact ? 'w-[220px]' : 'w-[250px] sm:w-[280px]'}`}
            style={{
                backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                backgroundPosition: 'center',
                backgroundSize: '420px 420px',
            }}
        >
            <div className="relative overflow-hidden rounded-[1.35rem] bg-[#E5DDED]">
                <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#181024]" />
                <div
                    className="paper-texture relative min-h-[430px] px-4 pb-5 pt-8"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(251,247,237,.86),rgba(251,247,237,.86)),url('/materials/cotton-paper.webp')",
                        backgroundSize: 'auto, 420px 420px',
                    }}
                >
                    <div className="absolute right-4 top-9 rotate-6 rounded-[4px] bg-[#C9A779] px-3 py-1 font-hand text-lg text-[#181024] shadow-sm">
                        nossa história
                    </div>
                    <section className="rounded-[6px] border border-[#C9BAD8] bg-[#FBF7ED] p-4 shadow-[3px_5px_0_#CFC1AE]">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-editorial text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF705F]">
                                página 01
                            </span>
                            <Heart aria-hidden="true" className="h-4 w-4 fill-[#FF705F] text-[#FF705F]" />
                        </div>
                        <h3 className="max-w-[11rem] text-2xl font-semibold leading-tight text-[#181024]">
                            Para guardar cada pedacinho da gente.
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#6F6877]">
                            Fotos, cartas e detalhes que viram um presente para abrir com calma.
                        </p>
                    </section>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="-rotate-2 rounded-[5px] border border-[#D6CFDD] bg-[#FBF7ED] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#F3C7C1] text-[#FF705F]">
                                <Camera aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#6F6877]">aquele dia</p>
                        </div>
                        <div className="rotate-2 rounded-[5px] border border-[#D6CFDD] bg-[#FBF7ED] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#D7E5DC] text-[#2E6856]">
                                <Mail aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#6F6877]">cartinha</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[8px] border border-[#A98BC4] bg-[#EFE9F3] p-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#FF705F] text-[#181024]">
                                <Music aria-hidden="true" className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#181024]">música de vocês</p>
                                <p className="truncate text-xs text-[#6F6877]">a trilha desse presente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
