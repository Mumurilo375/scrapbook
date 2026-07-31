import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Gift, LogIn, Mail, UserPlus } from 'lucide-react';
import type { FormEvent } from 'react';

type LoginProps = {
    createUrl: string;
    homeUrl: string;
    registerUrl: string;
    returnTo: string | null;
    storeUrl: string;
};

export default function Login({ createUrl, homeUrl, registerUrl, returnTo, storeUrl }: LoginProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
        return_to: returnTo ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(storeUrl);
    }

    return (
        <>
            <Head title="Entrar" />
            <main
                className="grid min-h-screen place-items-center bg-[#E5DDED] px-4 py-8 text-[#292331] sm:px-6"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(75,61,89,.075) 1px,transparent 1px),linear-gradient(90deg,rgba(75,61,89,.075) 1px,transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            >
                <section className="grid w-full max-w-5xl overflow-hidden rounded-[12px] border border-[#4B3D59] bg-[#FBF7ED] shadow-[0_28px_58px_#18102433] lg:grid-cols-[0.82fr_1.18fr]">
                    <aside
                        className="relative isolate min-h-36 overflow-hidden bg-[#181024] p-7 text-white sm:p-9 lg:min-h-[640px]"
                        style={{
                            backgroundImage:
                                "linear-gradient(140deg,rgba(169,139,196,.14),transparent 45%),url('/materials/bookcloth-aubergine.webp')",
                            backgroundPosition: 'center',
                            backgroundSize: 'auto, 520px 520px',
                        }}
                    >
                        <Link className="inline-flex items-center gap-3 text-white" href={homeUrl}>
                            <span className="grid h-10 w-10 place-items-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-lg font-bold">Scrapbook</span>
                        </Link>
                        <div className="mt-10 hidden max-w-sm lg:mt-28 lg:block">
                            <h2 className="font-display text-3xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-4xl">
                                Entrar na sua conta
                            </h2>
                            <p className="mt-5 max-w-[34ch] text-sm leading-6 text-[#CFC2D8]">
                                Continue criando seus rascunhos e volte para editar quando quiser.
                            </p>
                        </div>
                        <div className="absolute -bottom-16 -right-12 hidden h-52 w-40 rotate-6 rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] shadow-[0_18px_36px_#0D071466] lg:block">
                            <span className="absolute left-1/2 top-8 h-7 w-24 -translate-x-1/2 -rotate-3 bg-[#C9A779]/75" />
                            <span className="absolute left-7 right-7 top-20 h-px bg-[#C9BAD8]" />
                            <span className="absolute left-7 right-10 top-28 h-px bg-[#C9BAD8]" />
                        </div>
                    </aside>

                    <div
                        className="relative p-6 sm:p-10 lg:p-14"
                        style={{
                            backgroundImage:
                                "linear-gradient(rgba(251,247,237,.9),rgba(251,247,237,.9)),url('/materials/cotton-paper.webp')",
                            backgroundPosition: 'center',
                            backgroundSize: 'auto, 520px 520px',
                        }}
                    >
                        <Link
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F6877] hover:text-[#D95045]"
                            href={homeUrl}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para a landing
                        </Link>

                        <h1 className="mt-9 font-display text-3xl font-bold tracking-[-0.03em] text-[#181024] sm:text-4xl">
                            Entrar na sua conta
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-[#6F6877]">
                            Continue criando seus rascunhos e volte para editar quando quiser.
                        </p>

                        <form className="mt-8 grid gap-5" onSubmit={submit}>
                            <label className="grid gap-2 text-sm font-bold text-[#181024]">
                                E-mail
                                <input
                                    autoComplete="email"
                                    className="min-h-12 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-normal outline-none focus:border-[#181024] focus:ring-2 focus:ring-[#A98BC455]"
                                    onChange={(event) => setData('email', event.target.value)}
                                    type="email"
                                    value={data.email}
                                />
                                {errors.email && <span className="text-xs text-[#C8444B]">{errors.email}</span>}
                            </label>

                            <label className="grid gap-2 text-sm font-bold text-[#181024]">
                                Senha
                                <input
                                    autoComplete="current-password"
                                    className="min-h-12 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-normal outline-none focus:border-[#181024] focus:ring-2 focus:ring-[#A98BC455]"
                                    onChange={(event) => setData('password', event.target.value)}
                                    type="password"
                                    value={data.password}
                                />
                                {errors.password && <span className="text-xs text-[#C8444B]">{errors.password}</span>}
                            </label>

                            <label className="flex items-center gap-3 text-sm font-semibold text-[#6F6877]">
                                <input
                                    checked={data.remember}
                                    className="h-4 w-4 rounded border-[#A98BC4] text-[#FF705F]"
                                    onChange={(event) => setData('remember', event.target.checked)}
                                    type="checkbox"
                                />
                                Lembrar-me
                            </label>

                            <button
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-5 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] transition hover:-translate-y-px hover:bg-[#FF8273] disabled:opacity-60"
                                disabled={processing}
                                type="submit"
                            >
                                <LogIn aria-hidden="true" className="h-4 w-4" />
                                Entrar
                            </button>
                        </form>

                        <div className="mt-6 grid gap-3 border-t border-[#D6CFDD] pt-6 text-sm">
                            <Link
                                className="inline-flex items-center gap-2 font-bold text-[#D95045]"
                                href={registerUrl}
                            >
                                <UserPlus aria-hidden="true" className="h-4 w-4" />
                                Criar uma conta
                            </Link>
                            <Link
                                className="inline-flex items-center gap-2 font-semibold text-[#6F6877]"
                                href={createUrl}
                            >
                                <Mail aria-hidden="true" className="h-4 w-4" />
                                Escolher outro presente
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
