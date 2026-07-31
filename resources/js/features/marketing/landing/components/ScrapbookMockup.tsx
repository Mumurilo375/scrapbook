import { Camera, Heart, Mail, Music, Sparkles } from 'lucide-react';

export function ScrapbookMockup() {
    const paperTexture = {
        backgroundImage:
            "linear-gradient(rgba(251,247,237,.78),rgba(251,247,237,.78)),url('/materials/cotton-paper.webp')",
        backgroundPosition: 'center',
        backgroundSize: 'auto, 520px 520px',
    };

    return (
        <div className="relative mx-auto w-full max-w-[700px] px-3 pb-14 pt-10 sm:px-7 sm:pb-20 sm:pt-14">
            <span className="absolute left-0 top-1/2 hidden h-px w-16 -translate-y-1/2 bg-[#4B3D59]/45 sm:block" />
            <span className="absolute left-8 top-[calc(50%-8px)] hidden h-4 w-px bg-[#4B3D59]/45 sm:block" />
            <span className="absolute right-1 top-12 h-16 w-20 rotate-3 bg-[#C9A779]/70 shadow-[0_5px_12px_#1810241F]" />

            <div
                aria-hidden="true"
                className="absolute inset-x-1 bottom-11 top-12 rotate-[-0.6deg] rounded-[24px_20px_26px_28px] border border-[#291B2B] bg-[#43283D] shadow-[0_32px_52px_#18102442]"
                style={{
                    backgroundImage:
                        "linear-gradient(95deg,rgba(255,255,255,.08),transparent 30%,rgba(0,0,0,.12)),url('/materials/bookcloth-aubergine.webp')",
                    backgroundPosition: 'center',
                    backgroundSize: 'auto, 520px 520px',
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-x-4 bottom-[3.1rem] top-[3.75rem] rotate-[0.35deg] rounded-[20px] border border-[#B8AA97] bg-[#E8DFCF] shadow-[0_7px_0_#D4C6B3,0_13px_0_#BEAC93]"
                style={{
                    backgroundImage: "url('/materials/cotton-paper.webp')",
                    backgroundPosition: 'center',
                    backgroundSize: '480px 480px',
                }}
            />

            <div className="relative grid aspect-[1.68/1] grid-cols-2">
                <section
                    className="relative overflow-hidden rounded-l-[20px] border border-r-0 border-[#CFC1AE] bg-[#FBF7ED] px-[8%] py-[7%] shadow-[inset_-24px_0_34px_rgba(73,50,38,0.12)] [clip-path:polygon(1%_0,100%_0,100%_100%,1.5%_99.5%,0_69%,1%_36%)]"
                    style={paperTexture}
                >
                    <p className="font-display text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FF705F]">
                        capítulo 01
                    </p>
                    <h2 className="mt-[5%] max-w-[12ch] font-display text-[clamp(1.15rem,3.1vw,2.25rem)] font-bold leading-[0.92] tracking-[-0.03em] text-[#181024]">
                        Nossa história
                    </h2>
                    <p className="mt-[5%] max-w-[18ch] font-hand text-[clamp(0.85rem,1.8vw,1.4rem)] leading-[1.05] text-[#292331]">
                        pequenos momentos que viraram casa.
                    </p>

                    <div className="absolute bottom-[10%] left-[8%] w-[32%] -rotate-3 bg-white p-[2.5%] pb-[6%] shadow-[0_8px_16px_#1810242A]">
                        <div className="grid aspect-[4/5] place-items-center bg-[#D8CCE5] text-[#4B3D59]">
                            <Camera aria-hidden="true" className="h-[28%] w-[28%]" />
                        </div>
                        <p className="mt-[5%] text-center font-hand text-[clamp(.65rem,1.25vw,1rem)] leading-none">
                            aquele dia
                        </p>
                    </div>

                    <div className="absolute bottom-[8%] right-[7%] w-[45%] rotate-2 border border-[#D6CFDD] bg-[#F5F1EA] p-[5%] shadow-[0_7px_14px_#1810241F]">
                        <p className="font-hand text-[clamp(.7rem,1.45vw,1.15rem)] leading-[1.05] text-[#292331]">
                            Foi simples. Foi leve. Foi a gente.
                        </p>
                        <Heart
                            aria-hidden="true"
                            className="ml-auto mt-1 h-4 w-4 rotate-6 fill-[#FF705F]/25 text-[#D95045]"
                        />
                    </div>
                    <span className="absolute bottom-[27%] left-[29%] h-[8%] w-[26%] -rotate-6 bg-[#C9A779]/72 shadow-sm" />
                </section>

                <section
                    className="relative overflow-hidden rounded-r-[20px] border border-l-0 border-[#CFC1AE] bg-[#FBF7ED] px-[8%] py-[7%] shadow-[inset_24px_0_34px_rgba(73,50,38,0.13)] [clip-path:polygon(0_0,99%_.6%,100%_36%,99%_72%,100%_99%,0_100%)]"
                    style={paperTexture}
                >
                    <span className="absolute right-[7%] top-[5%] h-[9%] w-[28%] rotate-3 bg-[#A98BC4]/55 shadow-sm" />
                    <div className="relative ml-auto mt-[5%] w-[72%] rotate-2 bg-white p-[3%] pb-[6%] shadow-[0_10px_20px_#1810242B]">
                        <div className="grid aspect-[4/3] place-items-center bg-[#D6C9E1]">
                            <Heart aria-hidden="true" className="h-[22%] w-[22%] fill-[#FF705F]/45 text-[#D95045]" />
                        </div>
                    </div>

                    <div className="absolute bottom-[14%] left-[9%] w-[46%] -rotate-2 border border-[#D6CFDD] bg-white/90 p-[5%] shadow-[0_7px_14px_#1810241A]">
                        <p className="font-hand text-[clamp(.7rem,1.35vw,1.1rem)] leading-[1.1] text-[#292331]">
                            para abrir com calma e guardar pra sempre
                        </p>
                    </div>

                    <div className="absolute bottom-[9%] right-[8%] flex items-center gap-2 bg-[#281D36] px-[5%] py-[3%] text-[#FBF7ED] shadow-[0_7px_14px_#18102426]">
                        <Music aria-hidden="true" className="h-4 w-4 text-[#FF705F]" />
                        <span className="hidden text-[10px] font-bold uppercase tracking-[0.12em] sm:inline">
                            nossa música
                        </span>
                    </div>

                    <Heart
                        aria-hidden="true"
                        className="absolute left-[10%] top-[24%] h-[8%] w-[8%] -rotate-12 text-[#FF705F]"
                    />
                </section>

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[2%] left-1/2 top-[2%] z-30 w-[9%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#43283D]/25 to-transparent mix-blend-multiply"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[5%] left-1/2 top-[5%] z-40 w-6 -translate-x-1/2"
                >
                    {[17, 39, 61, 83].map((top) => (
                        <span
                            className="absolute left-1/2 h-3 w-6 -translate-x-1/2 -translate-y-1/2 rotate-90 rounded-full border-2 border-[#9D846C] border-l-[#725945] border-r-[#D9C5A7] shadow-[0_2px_3px_#311F1B47]"
                            key={top}
                            style={{ top: `${top}%` }}
                        />
                    ))}
                </div>
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 z-40 aspect-square w-[11%] bg-[linear-gradient(135deg,#CFC2B1_0_48%,#FFFDF7_50%_100%)] shadow-[-8px_-7px_18px_#3B261F29] [clip-path:polygon(0_0,100%_0,100%_100%)]"
                />
            </div>

            <div className="absolute bottom-0 left-1/2 z-50 flex w-[72%] -translate-x-1/2 items-center gap-3 border border-[#4B3D59] bg-[#281D36] px-4 py-3 text-[#FBF7ED] shadow-[0_16px_30px_#18102438] sm:w-[62%] sm:px-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-[#FF705F] text-[#181024]">
                    <Mail aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className="truncate font-hand text-xl leading-none sm:text-2xl">abre quando sentir saudade</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#CFC2D8]">
                        envelope digital
                    </p>
                </div>
            </div>

            <span className="absolute right-3 top-3 z-50 -rotate-3 border border-[#FF705F] bg-[#FFF0ED] px-3 py-1.5 font-hand text-lg text-[#D95045] shadow-[0_6px_12px_#1810241F] sm:right-8">
                feito pra emocionar
            </span>
            <Sparkles aria-hidden="true" className="absolute right-0 top-1/2 h-6 w-6 text-[#B8792E]" />
        </div>
    );
}
