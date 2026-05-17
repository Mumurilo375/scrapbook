import { Gift, Heart } from 'lucide-react';

import { CTAButton } from '../components/CTAButton';
import { brandName, navLinks } from '../landingData';

const footerLinks = ['Contato', 'Termos', 'Privacidade'];

export function Footer() {
    return (
        <footer className="border-t border-[#D8B991] bg-[#1F150A] text-[#FFF7EE]">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_1fr_auto] lg:px-8">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#BD8558] bg-[#FFF7EE] text-[#D93632]">
                            <Gift aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="font-editorial text-xl font-semibold">{brandName}</span>
                    </div>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-[#EAD2B8]">
                        Um scrapbook digital para guardar fotos, cartas e pedacinhos de memória com carinho.
                    </p>
                    <p className="mt-4 flex items-center gap-2 font-hand text-2xl text-[#EBC493]">
                        <Heart aria-hidden="true" className="h-5 w-5 fill-current" />
                        presente com cara de lembrança guardada
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                    <div>
                        <h3 className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#BD8558]">
                            Produto
                        </h3>
                        <div className="mt-4 space-y-3">
                            {navLinks.map((link) => (
                                <a className="block text-sm text-[#EAD2B8] hover:text-white" href={link.href} key={link.label}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-editorial text-xs font-semibold uppercase tracking-[0.16em] text-[#BD8558]">
                            Links
                        </h3>
                        <div className="mt-4 space-y-3">
                            {footerLinks.map((link) => (
                                <a className="block text-sm text-[#EAD2B8] hover:text-white" href="#topo" key={link}>
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
                    <p className="mt-4 text-xs text-[#CBA980]">Feito para presentes digitais emocionais.</p>
                </div>
            </div>
        </footer>
    );
}
