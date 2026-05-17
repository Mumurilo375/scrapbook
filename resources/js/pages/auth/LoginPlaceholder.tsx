import { Head, Link } from '@inertiajs/react';
import { Gift, Lock } from 'lucide-react';

type LoginPlaceholderProps = {
    mode?: 'register';
};

export default function LoginPlaceholder({ mode }: LoginPlaceholderProps) {
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get('return_to') ?? '/criar';

    return (
        <>
            <Head title={mode === 'register' ? 'Cadastro' : 'Login'} />
            <main className="scrapbook-background flex min-h-screen items-center justify-center bg-[#F7F1E8] px-4 py-12 text-[#1F1A17]">
                <section className="w-full max-w-md rounded-[8px] border border-[#dfc7a7] bg-[#FFF8EC] p-6 shadow-[0_16px_40px_rgba(58,36,24,0.09)]">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#caa77d] bg-[#f4e2c6] text-[#8E2F2F]">
                        <Lock aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <h1 className="mt-5 text-3xl font-semibold text-[#3A2418]">
                        {mode === 'register' ? 'Cadastro em preparação' : 'Login em preparação'}
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-[#6F4E37]">
                        A área autenticada já usa o middleware padrão do Laravel. A tela final de login/cadastro entra na próxima etapa de autenticação.
                    </p>
                    <div className="mt-6 grid gap-3">
                        <Link
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[6px] border border-[#5f2c24] bg-[#8E2F2F] px-4 text-sm font-semibold text-[#FFF8EC] hover:bg-[#742727]"
                            href={returnTo}
                        >
                            <Gift aria-hidden="true" className="h-4 w-4" />
                            Voltar para criação
                        </Link>
                        <Link
                            className="inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[#d8b98e] bg-white px-4 text-sm font-semibold text-[#6F4E37] hover:bg-[#f4e2c6]"
                            href="/"
                        >
                            Ir para a landing
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}
