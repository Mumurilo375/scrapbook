import { Camera, Heart, Mail, Music } from 'lucide-react';

type PhoneMockupProps = {
    compact?: boolean;
};

export function PhoneMockup({ compact = false }: PhoneMockupProps) {
    return (
        <div
            className={`mx-auto rounded-[2rem] border-[10px] border-[#1F150A] bg-[#1F150A] shadow-[0_28px_54px_#221C1942] ${compact ? 'w-[220px]' : 'w-[250px] sm:w-[280px]'}`}
        >
            <div className="relative overflow-hidden rounded-[1.35rem] bg-[#F4E8D9]">
                <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-[#1F150A]" />
                <div className="paper-texture relative min-h-[430px] px-4 pb-5 pt-8">
                    <div className="absolute right-4 top-9 rotate-6 rounded-[4px] bg-[#C49A70] px-3 py-1 font-hand text-lg text-[#1F150A] shadow-sm">
                        nossa história
                    </div>
                    <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-editorial text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[#D93632]">
                                página 01
                            </span>
                            <Heart aria-hidden="true" className="h-4 w-4 fill-[#E66F65] text-[#E66F65]" />
                        </div>
                        <h3 className="max-w-[11rem] text-2xl font-semibold leading-tight text-[#1F150A]">
                            Para guardar cada pedacinho da gente.
                        </h3>
                        <p className="mt-3 text-sm leading-relaxed text-[#42291D]">
                            Fotos, cartas e detalhes que viram um presente para abrir com calma.
                        </p>
                    </section>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="-rotate-2 rounded-[5px] border border-[#E5D0B8] bg-[#FFF7EE] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#F0C9C3] text-[#D93632]">
                                <Camera aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#42291D]">aquele dia</p>
                        </div>
                        <div className="rotate-2 rounded-[5px] border border-[#E5D0B8] bg-[#FFF7EE] p-2 shadow-sm">
                            <div className="flex aspect-[4/5] items-center justify-center rounded-[3px] bg-[#DDE2C6] text-[#48573A]">
                                <Mail aria-hidden="true" className="h-8 w-8" />
                            </div>
                            <p className="mt-2 truncate text-center font-hand text-lg text-[#42291D]">cartinha</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-[8px] border border-[#CBA980] bg-[#EAD2B8] p-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D93632] text-[#FFF7EE]">
                                <Music aria-hidden="true" className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#1F150A]">música de vocês</p>
                                <p className="truncate text-xs text-[#42291D]">a trilha desse presente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
