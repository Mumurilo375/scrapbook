import { Head } from '@inertiajs/react';
import { ArrowLeft, Gift, Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <>
            <Head title="Pagina nao encontrada" />
            <main className="scrapbook-background flex min-h-screen items-center bg-[#F4E8D9] px-4 py-10 text-[#221C19] sm:px-6 lg:px-8">
                <section className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                    <div>
                        <a
                            className="inline-flex items-center gap-2 rounded-full border border-[#CBA980] bg-[#FFF7EE] px-4 py-2 text-sm font-semibold text-[#42291D] transition hover:bg-white"
                            href="/"
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para o inicio
                        </a>

                        <p className="mt-8 font-hand text-4xl text-[#D93632] sm:text-5xl">404</p>
                        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[#1F150A] sm:text-5xl lg:text-6xl">
                            Esta pagina saiu do album.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-[#42291D]">
                            O link pode ter mudado, expirado ou nunca ter existido. Voce pode voltar para a pagina
                            inicial ou comecar um novo scrapbook digital.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <a
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D93632] px-6 py-3 text-sm font-bold text-[#FFF7EE] shadow-[0_14px_28px_rgba(217,54,50,0.24)] transition hover:bg-[#B92D2A]"
                                href="/"
                            >
                                <Home aria-hidden="true" className="h-4 w-4" />
                                Ir para a home
                            </a>
                            <a
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#CBA980] bg-[#FFF7EE] px-6 py-3 text-sm font-bold text-[#42291D] transition hover:bg-white"
                                href="/criar"
                            >
                                <Gift aria-hidden="true" className="h-4 w-4" />
                                Criar presente
                            </a>
                        </div>
                    </div>

                    <div className="relative mx-auto min-h-[420px] w-full max-w-lg">
                        <div className="absolute left-4 top-8 h-16 w-32 rotate-[-8deg] rounded-sm bg-[#E66F65] opacity-90 shadow-lg" />
                        <div className="paper-texture absolute inset-x-4 top-16 rotate-[3deg] rounded-[8px] border border-[#D8B98C] bg-[#FFF7EE] p-6 shadow-[0_22px_60px_rgba(66,41,29,0.18)] sm:p-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-hand text-3xl text-[#AD7948]">pagina perdida</p>
                                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7E8F68]">
                                        link nao encontrado
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F4E8D9] text-[#D93632]">
                                    <Search aria-hidden="true" className="h-6 w-6" />
                                </span>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="h-4 w-3/4 rounded-full bg-[#EAD5BA]" />
                                <div className="h-4 w-full rounded-full bg-[#EAD5BA]" />
                                <div className="h-4 w-2/3 rounded-full bg-[#EAD5BA]" />
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="aspect-[4/5] rotate-[-4deg] rounded-[6px] border-8 border-white bg-[#D8B98C] shadow-md" />
                                <div className="aspect-[4/5] rotate-[5deg] rounded-[6px] border-8 border-white bg-[#7E8F68] shadow-md" />
                            </div>
                        </div>
                        <div className="absolute bottom-8 right-0 h-14 w-36 rotate-[7deg] rounded-sm bg-[#BD8558] opacity-85 shadow-lg" />
                    </div>
                </section>
            </main>
        </>
    );
}
