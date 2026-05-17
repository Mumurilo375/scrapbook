import { Gift, Heart } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { brandName, navLinks } from '../landingData';

const footerLinks = ['Contato', 'Termos', 'Privacidade'];

export function Footer() {
    return (
        <footer className="border-t border-[#dfc7a7] bg-[#3A2418] text-[#FFF8EC]">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1fr_auto] lg:px-8">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C99A4A] bg-[#FFF8EC] text-[#8E2F2F]">
                            <Gift aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="font-editorial text-xl font-semibold">{brandName}</span>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-[#f1dfc8]">
                        Um scrapbook digital para guardar fotos, cartas e pedacinhos de memória com carinho.
                    </p>
                    <p className="mt-4 flex items-center gap-2 font-hand text-2xl text-[#f6deb0]">
                        <Heart aria-hidden="true" className="h-5 w-5 fill-current" />
                        presente com cara de lembrança guardada
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div>
                        <h3 className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#C99A4A]">
                            Produto
                        </h3>
                        <div className="mt-4 space-y-3">
                            {navLinks.map((link) => (
                                <a className="block text-sm text-[#f1dfc8] hover:text-white" href={link.href} key={link.label}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#C99A4A]">
                            Links
                        </h3>
                        <div className="mt-4 space-y-3">
                            {footerLinks.map((link) => (
                                <a className="block text-sm text-[#f1dfc8] hover:text-white" href="#topo" key={link}>
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:text-right">
                    <CTAButton href="/criar" variant="light">
                        Criar presente
                    </CTAButton>
                    <p className="mt-4 text-xs text-[#d8b98e]">Feito para presentes digitais emocionais.</p>
                </div>
            </div>
        </footer>
    );
}
