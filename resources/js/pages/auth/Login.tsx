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
            <main className="scrapbook-background flex min-h-screen items-center justify-center bg-[#F7F1E8] px-4 py-10 text-[#1F1A17]">
                <section className="w-full max-w-md rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-6 shadow-[0_16px_40px_rgba(58,36,24,0.09)]">
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6F4E37] hover:text-[#8E2F2F]"
                        href={homeUrl}
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Voltar para a landing
                    </Link>

                    <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#caa77d] bg-[#f4e2c6] text-[#8E2F2F]">
                        <Gift aria-hidden="true" className="h-5 w-5" />
                    </div>

                    <h1 className="mt-5 text-3xl font-semibold text-[#3A2418]">Entrar na sua conta</h1>
                    <p className="mt-3 text-sm leading-6 text-[#6F4E37]">
                        Continue criando seus rascunhos e volte para editar quando quiser.
                    </p>

                    <form className="mt-6 grid gap-4" onSubmit={submit}>
                        <label className="grid gap-2 text-sm font-semibold text-[#3A2418]">
                            E-mail
                            <input
                                autoComplete="email"
                                className="min-h-11 rounded-[6px] border border-[#d8b98e] bg-white px-3 text-sm font-normal outline-none focus:border-[#8E2F2F]"
                                onChange={(event) => setData('email', event.target.value)}
                                type="email"
                                value={data.email}
                            />
                            {errors.email && <span className="text-xs text-[#8E2F2F]">{errors.email}</span>}
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#3A2418]">
                            Senha
                            <input
                                autoComplete="current-password"
                                className="min-h-11 rounded-[6px] border border-[#d8b98e] bg-white px-3 text-sm font-normal outline-none focus:border-[#8E2F2F]"
                                onChange={(event) => setData('password', event.target.value)}
                                type="password"
                                value={data.password}
                            />
                            {errors.password && <span className="text-xs text-[#8E2F2F]">{errors.password}</span>}
                        </label>

                        <label className="flex items-center gap-3 text-sm font-semibold text-[#6F4E37]">
                            <input
                                checked={data.remember}
                                className="h-4 w-4 rounded border-[#d8b98e] text-[#8E2F2F]"
                                onChange={(event) => setData('remember', event.target.checked)}
                                type="checkbox"
                            />
                            Lembrar-me
                        </label>

                        <button
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-[#5f2c24] bg-[#8E2F2F] px-5 text-sm font-semibold text-[#FFF8EC] transition hover:bg-[#742727] disabled:opacity-60"
                            disabled={processing}
                            type="submit"
                        >
                            <LogIn aria-hidden="true" className="h-4 w-4" />
                            Entrar
                        </button>
                    </form>

                    <div className="mt-5 grid gap-3 border-t border-[#ead8bf] pt-5 text-sm">
                        <Link
                            className="inline-flex items-center gap-2 font-semibold text-[#8E2F2F]"
                            href={registerUrl}
                        >
                            <UserPlus aria-hidden="true" className="h-4 w-4" />
                            Criar uma conta
                        </Link>
                        <Link className="inline-flex items-center gap-2 font-semibold text-[#6F4E37]" href={createUrl}>
                            <Mail aria-hidden="true" className="h-4 w-4" />
                            Escolher outro presente
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
