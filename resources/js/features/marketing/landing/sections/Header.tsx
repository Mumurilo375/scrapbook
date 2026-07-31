import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Gift, LogOut, Menu, UserCircle, X } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { brandName, navLinks } from '../landingData';

type SharedProps = {
    auth?: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
};

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { auth } = usePage().props as unknown as SharedProps;
    const user = auth?.user ?? null;

    function logout() {
        router.post('/logout');
    }

    return (
        <header
            className="sticky top-0 z-50 border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_rgba(16,8,24,0.22)]"
            style={{
                backgroundImage:
                    "linear-gradient(90deg,rgba(255,255,255,.025),transparent 28%),url('/materials/bookcloth-aubergine.webp')",
                backgroundPosition: 'center',
                backgroundSize: 'auto, 520px 520px',
            }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <a className="flex items-center gap-3 text-white" href="#topo" aria-label="Voltar ao início">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                        <Gift aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-display text-xl font-bold tracking-[-0.02em]">{brandName}</span>
                </a>

                <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
                    {navLinks.map((link) => (
                        <a
                            className="text-sm font-semibold text-[#D8CFDF] transition hover:text-white"
                            href={link.href}
                            key={link.label}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <>
                            <Link
                                className="hidden min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-transparent px-4 text-sm font-semibold text-white transition hover:bg-[#281D36] sm:inline-flex"
                                href="/app/gifts"
                            >
                                <UserCircle aria-hidden="true" className="h-4 w-4" />
                                Meus presentes
                            </Link>
                            <button
                                className="hidden min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-transparent px-4 text-sm font-semibold text-[#D8CFDF] transition hover:bg-[#281D36] hover:text-white sm:inline-flex"
                                onClick={logout}
                                type="button"
                            >
                                <LogOut aria-hidden="true" className="h-4 w-4" />
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link
                            className="hidden min-h-10 rounded-[4px] border border-[#675578] bg-transparent px-4 text-sm font-semibold text-white transition hover:bg-[#281D36] sm:inline-flex sm:items-center"
                            href="/login"
                        >
                            Login
                        </Link>
                    )}
                    <CTAButton className="min-h-10 px-4 py-2 sm:px-5" href="/criar" icon="none">
                        Criar presente
                    </CTAButton>
                    <button
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-white md:hidden"
                        onClick={() => setIsMenuOpen((current) => !current)}
                        type="button"
                    >
                        {isMenuOpen ? (
                            <X aria-hidden="true" className="h-5 w-5" />
                        ) : (
                            <Menu aria-hidden="true" className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <nav
                    aria-label="Navegação mobile"
                    className="border-t border-[#4B3D59] bg-[#281D36] px-4 py-3 shadow-[0_18px_30px_#18102455] md:hidden"
                >
                    <div className="mx-auto grid max-w-7xl gap-2">
                        {navLinks.map((link) => (
                            <a
                                className="rounded-[4px] px-3 py-2 text-sm font-semibold text-[#D8CFDF] hover:bg-[#3A2A48] hover:text-white"
                                href={link.href}
                                key={link.label}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        {user ? (
                            <>
                                <Link
                                    className="rounded-[4px] px-3 py-2 text-sm font-semibold text-[#D8CFDF] hover:bg-[#3A2A48] hover:text-white"
                                    href="/app/gifts"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Meus presentes
                                </Link>
                                <button
                                    className="rounded-[4px] px-3 py-2 text-left text-sm font-semibold text-[#D8CFDF] hover:bg-[#3A2A48] hover:text-white"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    type="button"
                                >
                                    Sair
                                </button>
                            </>
                        ) : (
                            <Link
                                className="rounded-[4px] px-3 py-2 text-sm font-semibold text-[#D8CFDF] hover:bg-[#3A2A48] hover:text-white"
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
