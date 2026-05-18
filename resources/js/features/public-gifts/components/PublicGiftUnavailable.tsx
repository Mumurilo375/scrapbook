import { Link } from '@inertiajs/react';
import { ArrowLeft, Gift, Heart } from 'lucide-react';

type PublicGiftUnavailableProps = {
    createUrl: string;
};

export function PublicGiftUnavailable({ createUrl }: PublicGiftUnavailableProps) {
    return (
        <main className="scrapbook-background grid min-h-screen place-items-center bg-[#F4E8D9] px-4 py-10 text-[#221C19]">
            <section className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                    <Link
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-4 text-sm font-semibold text-[#42291D] transition hover:bg-white"
                        href="/"
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Voltar para o início
                    </Link>

                    <p className="mt-8 font-hand text-4xl leading-none text-[#D93632] sm:text-5xl">ops...</p>
                    <h1 className="mt-4 max-w-xl font-editorial text-4xl font-semibold leading-tight text-[#1F150A] sm:text-5xl">
                        Este presente não está disponível
                    </h1>
                    <p className="mt-5 max-w-lg text-base font-semibold leading-8 text-[#42291D]">
                        O link pode ter mudado ou o scrapbook pode não estar mais aberto para visita.
                    </p>

                    <Link
                        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-5 text-sm font-bold text-[#FFF7EE] shadow-[0_14px_28px_rgba(217,54,50,0.24)] transition hover:bg-[#B92D2A]"
                        href={createUrl}
                    >
                        <Gift aria-hidden="true" className="h-4 w-4" />
                        Criar o meu também
                    </Link>
                </div>

                <div aria-hidden="true" className="relative mx-auto min-h-[360px] w-full max-w-md">
                    <div className="absolute left-8 top-5 h-16 w-36 rotate-[-8deg] rounded-[4px] bg-[#D9B77E] opacity-80 shadow-lg" />
                    <div className="paper-grain absolute inset-x-5 top-14 rotate-[3deg] rounded-[10px] border border-[#D8B991] bg-[#FFF7EE] p-7 shadow-[0_24px_70px_rgba(66,41,29,0.18)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-hand text-3xl leading-none text-[#AD7948]">presente fechado</p>
                                <div className="mt-5 grid gap-3">
                                    <div className="h-3 w-40 rounded-full bg-[#EAD5BA]" />
                                    <div className="h-3 w-56 rounded-full bg-[#EAD5BA]" />
                                    <div className="h-3 w-32 rounded-full bg-[#EAD5BA]" />
                                </div>
                            </div>
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#F4E8D9] text-[#D93632]">
                                <Heart className="h-6 w-6" />
                            </span>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            <div className="aspect-[4/5] rotate-[-4deg] rounded-[6px] border-8 border-white bg-[#D8B98C] shadow-md" />
                            <div className="aspect-[4/5] rotate-[5deg] rounded-[6px] border-8 border-white bg-[#E66F65] shadow-md" />
                        </div>
                    </div>
                    <div className="absolute bottom-7 right-5 h-14 w-32 rotate-[8deg] rounded-[4px] bg-[#E66F65] opacity-75 shadow-lg" />
                </div>
            </section>
        </main>
    );
}
