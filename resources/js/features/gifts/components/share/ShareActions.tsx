import { Download, ExternalLink, Printer } from 'lucide-react';

import { useAnalytics } from '../../../../lib/analytics';
import { CopyPublicLinkButton } from './CopyPublicLinkButton';

type ShareActionsProps = {
    cardPrintUrl: string;
    publicUrl: string;
    qrCodeDownloadUrl: string;
};

const buttonClass =
    'inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]';

export function ShareActions({ cardPrintUrl, publicUrl, qrCodeDownloadUrl }: ShareActionsProps) {
    const { trackEvent } = useAnalytics();

    return (
        <div className="flex flex-wrap gap-2">
            <CopyPublicLinkButton className={buttonClass} publicUrl={publicUrl} />
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#73A58E] bg-[#E8F2ED] px-3 text-sm font-bold text-[#2E6856] hover:bg-[#D5E9DF]"
                href={publicUrl}
                rel="noreferrer"
                target="_blank"
            >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Abrir link
            </a>
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                download
                href={qrCodeDownloadUrl}
                onClick={() => trackEvent('qr_code_downloaded', { payload: { surface: 'share_page' } })}
            >
                <Download aria-hidden="true" className="h-4 w-4" />
                Baixar QR
            </a>
            <a
                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                href={cardPrintUrl}
                onClick={() => trackEvent('share_card_print_clicked', { payload: { surface: 'share_page' } })}
            >
                <Printer aria-hidden="true" className="h-4 w-4" />
                Imprimir cartão
            </a>
        </div>
    );
}
