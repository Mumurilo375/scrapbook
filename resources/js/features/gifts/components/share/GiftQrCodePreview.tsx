import { Download, ExternalLink, QrCode } from 'lucide-react';

type GiftQrCodePreviewProps = {
    downloadUrl: string;
    publicUrl: string;
    qrCodeUrl: string;
};

export function GiftQrCodePreview({ downloadUrl, publicUrl, qrCodeUrl }: GiftQrCodePreviewProps) {
    return (
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">QR Code</p>
                    <h2 className="mt-2 text-xl font-semibold text-[#1F150A]">Pronto para entregar</h2>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-[#CBA980] bg-white text-[#D93632]">
                    <QrCode aria-hidden="true" className="h-5 w-5" />
                </span>
            </div>

            <div className="mt-5 grid justify-items-center gap-4">
                <div className="rounded-[8px] border border-[#E5D0B8] bg-white p-4 shadow-inner">
                    <img alt="QR Code do presente publicado" className="h-56 w-56" src={qrCodeUrl} />
                </div>
                <p className="max-w-sm break-all text-center text-sm text-[#6F5A4A]">{publicUrl}</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                    download
                    href={downloadUrl}
                >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Baixar QR Code
                </a>
                <a
                    className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
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
