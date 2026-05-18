import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Eye, Gift, PenLine, Share2 } from 'lucide-react';

import { GiftStatusBadge } from '../../components/GiftStatusBadge';
import { GiftQrCodePreview } from '../../components/share/GiftQrCodePreview';
import { GiftShareCard } from '../../components/share/GiftShareCard';
import { ShareActions } from '../../components/share/ShareActions';
import type { ShareCardData } from '../../components/share/shareTypes';

type ShareGift = {
    expires_at: string | null;
    id: string;
    published_at: string | null;
    recipient_name: string | null;
    sender_name: string | null;
    status: string;
    title: string;
    urls: {
        dashboard: string;
        edit: string;
        preview: string;
        review: string;
    };
};

type SharePayload = {
    can_share: boolean;
    card: ShareCardData | null;
    card_download_url: string | null;
    card_url: string | null;
    public_url: string | null;
    qr_code_download_url: string | null;
    qr_code_url: string | null;
    status_message: string | null;
};

type GiftShareProps = {
    gift: ShareGift;
    share: SharePayload;
};

export default function GiftShare({ gift, share }: GiftShareProps) {
    const canShare = Boolean(
        share.can_share &&
            share.public_url &&
            share.qr_code_url &&
            share.qr_code_download_url &&
            share.card_url &&
            share.card_download_url &&
            share.card,
    );
    const shareData = canShare
        ? {
              card: share.card as ShareCardData,
              cardDownloadUrl: share.card_download_url as string,
              cardUrl: share.card_url as string,
              publicUrl: share.public_url as string,
              qrCodeDownloadUrl: share.qr_code_download_url as string,
              qrCodeUrl: share.qr_code_url as string,
          }
        : null;

    return (
        <>
            <Head title={`Compartilhar ${gift.title}`} />
            <main className="scrapbook-background min-h-screen bg-[#F4E8D9] text-[#221C19]">
                <header className="border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-[#1F150A]" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-editorial text-xl font-semibold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                                href={gift.urls.dashboard}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Meus presentes
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                                href={gift.urls.preview}
                            >
                                <Eye aria-hidden="true" className="h-4 w-4" />
                                Preview
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
                            <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Entrega</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="text-3xl font-semibold text-[#1F150A]">{gift.title}</h1>
                                <GiftStatusBadge status={gift.status} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#6F5A4A]">
                                {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                                {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                            </p>

                            {shareData ? (
                                <>
                                    <p className="mt-5 break-all rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3 text-sm text-[#42291D]">
                                        {shareData.publicUrl}
                                    </p>
                                    <div className="mt-4">
                                        <ShareActions
                                            cardPrintUrl={shareData.cardDownloadUrl}
                                            publicUrl={shareData.publicUrl}
                                            qrCodeDownloadUrl={shareData.qrCodeDownloadUrl}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="mt-5 rounded-[8px] border border-[#EBC493] bg-[#FFF1DD] p-4">
                                    <p className="text-sm font-semibold text-[#42291D]">
                                        {share.status_message ?? 'Publique o presente para gerar QR Code.'}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                                            href={gift.urls.review}
                                        >
                                            <Share2 aria-hidden="true" className="h-4 w-4" />
                                            Revisar publicação
                                        </Link>
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                                            href={gift.urls.edit}
                                        >
                                            <PenLine aria-hidden="true" className="h-4 w-4" />
                                            Voltar ao editor
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {shareData ? (
                        <div className="grid content-start gap-5">
                            <GiftQrCodePreview
                                downloadUrl={shareData.qrCodeDownloadUrl}
                                publicUrl={shareData.publicUrl}
                                qrCodeUrl={shareData.qrCodeUrl}
                            />
                            <GiftShareCard
                                card={shareData.card}
                                cardUrl={shareData.cardUrl}
                                printUrl={shareData.cardDownloadUrl}
                                qrCodeUrl={shareData.qrCodeUrl}
                            />
                        </div>
                    ) : null}
                </section>
            </main>
        </>
    );
}
