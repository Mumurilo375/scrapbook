import { useState } from 'react';
import { Gift, Menu, X } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { brandName, navLinks } from '../landingData';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-[#ead8bf] bg-[#F7F1E8]/92 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <a className="flex items-center gap-3 text-[#3A2418]" href="#topo" aria-label="Voltar ao início">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#caa77d] bg-[#FFF8EC] text-[#8E2F2F] shadow-sm">
                        <Gift aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-editorial text-xl font-semibold tracking-wide">{brandName}</span>
                </a>

                <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
                    {navLinks.map((link) => (
                        <a
                            className="text-sm font-medium text-[#6F4E37] transition hover:text-[#8E2F2F]"
                            href={link.href}
                            key={link.label}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        className="hidden min-h-10 rounded-full border border-[#d8b98e] bg-[#FFF8EC] px-4 text-sm font-semibold text-[#6F4E37] transition hover:bg-white sm:inline-flex sm:items-center"
                        title="Login em breve"
                        type="button"
                    >
                        Login
                    </button>
                    <CTAButton className="min-h-10 px-4 py-2 sm:px-5" href="#preco" icon="none">
                        Criar presente
                    </CTAButton>
                    <button
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b98e] bg-[#FFF8EC] text-[#6F4E37] md:hidden"
                        onClick={() => setIsMenuOpen((current) => !current)}
                        type="button"
                    >
                        {isMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <nav
                    aria-label="Navegação mobile"
                    className="border-t border-[#ead8bf] bg-[#FFF8EC] px-4 py-3 shadow-[0_18px_30px_rgba(58,36,24,0.08)] md:hidden"
                >
                    <div className="mx-auto grid max-w-7xl gap-2">
                        {navLinks.map((link) => (
                            <a
                                className="rounded-[6px] px-3 py-2 text-sm font-semibold text-[#6F4E37] hover:bg-[#f4e2c6] hover:text-[#8E2F2F]"
                                href={link.href}
                                key={link.label}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </nav>
            )}
        </header>
    );
}
