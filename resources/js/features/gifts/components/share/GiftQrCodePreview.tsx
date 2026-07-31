import { Download, ExternalLink, QrCode } from 'lucide-react';

type GiftQrCodePreviewProps = {
    downloadUrl: string;
    publicUrl: string;
    qrCodeUrl: string;
};

export function GiftQrCodePreview({ downloadUrl, publicUrl, qrCodeUrl }: GiftQrCodePreviewProps) {
    return (
        <section
            className="relative overflow-hidden rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 460px 460px',
            }}
        >
            <span className="absolute right-8 top-0 h-6 w-20 rotate-2 bg-[#A98BC4]/55" />
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">QR Code</p>
                    <h2 className="mt-2 font-display text-xl font-bold text-[#181024]">Pronto para entregar</h2>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#A98BC4] bg-white text-[#FF705F]">
                    <QrCode aria-hidden="true" className="h-5 w-5" />
                </span>
            </div>

            <div className="mt-5 grid justify-items-center gap-4">
                <div className="-rotate-1 border border-[#D6CFDD] bg-white p-4 pb-7 shadow-[0_10px_20px_#18102424]">
                    <img alt="QR Code do presente publicado" className="h-56 w-56" src={qrCodeUrl} />
                </div>
                <p className="max-w-sm break-all text-center text-sm text-[#6F6877]">{publicUrl}</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-bold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                    download
                    href={downloadUrl}
                >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Baixar QR Code
                </a>
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#A98BC4] bg-white px-3 text-sm font-bold text-[#292331] hover:bg-[#F3EFF6]"
                    href={publicUrl}
                    rel="noreferrer"
                    target="_blank"
                >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    Abrir link
                </a>
            </div>
        </section>
    );
}
