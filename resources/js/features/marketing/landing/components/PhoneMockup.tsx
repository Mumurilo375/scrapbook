import { Camera, Heart, Mail, Music } from 'lucide-react';

type PhoneMockupProps = {
    compact?: boolean;
};

export function PhoneMockup({ compact = false }: PhoneMockupProps) {
    return (
        <div
            className={`mx-auto rounded-[2rem] border-[10px] border-[#2b1d17] bg-[#2b1d17] shadow-[0_28px_54px_rgba(58,36,24,0.26)] ${compact ? 'w-[220px]' : 'w-[250px] sm:w-[280px]'}`}
        >
            <div className="relative overflow-hidden rounded-[1.35rem] bg-[#F7F1E8]">
                <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#2b1d17]" />
                <div className="paper-texture relative min-h-[430px] px-4 pb-5 pt-8">
                    <div className="absolute right-4 top-9 rotate-6 rounded-[4px] bg-[#d6b58d] px-3 py-1 font-hand text-lg text-[#3A2418] shadow-sm">
                        nossa história
                    </div>
                    <section className="rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-editorial text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#8E2F2F]">
                                página 01
                            </span>
                            <Heart aria-hidden="true" className="h-4 w-4 fill-[#C96F72] text-[#C96F72]" />
                        </div>
                        <h3 className="max-w-[11rem] text-2xl font-semibold leading-tight text-[#3A2418]">
                            Para guardar cada pedacinho da gente.
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#6F4E37]">
                            Fotos, cartas e detalhes que viram um presente para abrir com calma.
                        </p>
                    </section>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="-rotate-2 rounded-[5px] border border-[#ead8bf] bg-[#fffaf2] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#e7c4ba] text-[#8E2F2F]">
                                <Camera aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#6F4E37]">aquele dia</p>
                        </div>
                        <div className="rotate-2 rounded-[5px] border border-[#ead8bf] bg-[#fffaf2] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#d9dcbc] text-[#465234]">
                                <Mail aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#6F4E37]">cartinha</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[8px] border border-[#d8b98e] bg-[#f4e2c6] p-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8E2F2F] text-[#FFF8EC]">
                                <Music aria-hidden="true" className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#3A2418]">música de vocês</p>
                                <p className="truncate text-xs text-[#6F4E37]">a trilha desse presente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
