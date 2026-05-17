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
            <main className="scrapbook-background flex min-h-screen items-center justify-center bg-[#F4E8D9] px-4 py-10 text-[#221C19]">
                <section className="w-full max-w-md rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-6 shadow-[0_16px_40px_#221C1917]">
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#42291D] hover:text-[#D93632]"
                        href={homeUrl}
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Voltar para a landing
                    </Link>

                    <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#B78D5C] bg-[#EAD2B8] text-[#D93632]">
                        <Gift aria-hidden="true" className="h-5 w-5" />
                    </div>

                    <h1 className="mt-5 text-3xl font-semibold text-[#1F150A]">Entrar na sua conta</h1>
                    <p className="mt-3 text-sm leading-6 text-[#42291D]">
                        Continue criando seus rascunhos e volte para editar quando quiser.
                    </p>

                    <form className="mt-6 grid gap-4" onSubmit={submit}>
                        <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                            E-mail
                            <input
                                autoComplete="email"
                                className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal outline-none focus:border-[#D93632]"
                                onChange={(event) => setData('email', event.target.value)}
                                type="email"
                                value={data.email}
                            />
                            {errors.email && <span className="text-xs text-[#D93632]">{errors.email}</span>}
                        </label>

                        <label className="grid gap-2 text-sm font-semibold text-[#1F150A]">
                            Senha
                            <input
                                autoComplete="current-password"
                                className="min-h-11 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-normal outline-none focus:border-[#D93632]"
                                onChange={(event) => setData('password', event.target.value)}
                                type="password"
                                value={data.password}
                            />
                            {errors.password && <span className="text-xs text-[#D93632]">{errors.password}</span>}
                        </label>

                        <label className="flex items-center gap-3 text-sm font-semibold text-[#42291D]">
                            <input
                                checked={data.remember}
                                className="h-4 w-4 rounded border-[#CBA980] text-[#D93632]"
                                onChange={(event) => setData('remember', event.target.checked)}
                                type="checkbox"
                            />
                            Lembrar-me
                        </label>

                        <button
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-5 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#B92827] disabled:opacity-60"
                            disabled={processing}
                            type="submit"
                        >
                            <LogIn aria-hidden="true" className="h-4 w-4" />
                            Entrar
                        </button>
                    </form>

                    <div className="mt-5 grid gap-3 border-t border-[#E5D0B8] pt-5 text-sm">
                        <Link
                            className="inline-flex items-center gap-2 font-semibold text-[#D93632]"
                            href={registerUrl}
                        >
                            <UserPlus aria-hidden="true" className="h-4 w-4" />
                            Criar uma conta
                        </Link>
                        <Link className="inline-flex items-center gap-2 font-semibold text-[#42291D]" href={createUrl}>
                            <Mail aria-hidden="true" className="h-4 w-4" />
                            Escolher outro presente
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
