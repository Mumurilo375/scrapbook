import { Download, ExternalLink, Printer } from 'lucide-react';

import { CopyPublicLinkButton } from './CopyPublicLinkButton';

type ShareActionsProps = {
    cardPrintUrl: string;
    publicUrl: string;
    qrCodeDownloadUrl: string;
};

const buttonClass =
    'inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]';

export function ShareActions({ cardPrintUrl, publicUrl, qrCodeDownloadUrl }: ShareActionsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <CopyPublicLinkButton className={buttonClass} publicUrl={publicUrl} />
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-[#E7EBD8] px-3 text-sm font-semibold text-[#48573A] hover:bg-[#DCE4CB]"
                href={publicUrl}
                rel="noreferrer"
                target="_blank"
            >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Abrir link
            </a>
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                download
                href={qrCodeDownloadUrl}
            >
                <Download aria-hidden="true" className="h-4 w-4" />
                Baixar QR
            </a>
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                href={cardPrintUrl}
            >
                <Printer aria-hidden="true" className="h-4 w-4" />
                Imprimir cartão
            </a>
        </div>
    );
}
