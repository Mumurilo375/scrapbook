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
            <main className="min-h-screen bg-[#E5DDED] font-sans text-[#292331]">
                <header
                    className="border-b border-[#4B3D59] bg-[#181024] text-white shadow-[0_4px_18px_#18102438]"
                    style={{
                        backgroundImage: "url('/materials/bookcloth-aubergine.webp')",
                        backgroundPosition: 'center',
                        backgroundSize: '520px 520px',
                    }}
                >
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <Link className="flex items-center gap-3 text-white" href="/">
                            <span className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-[#675578] bg-[#281D36] text-[#A98BC4]">
                                <Gift aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="font-display text-xl font-bold">Scrapbook</span>
                        </Link>
                        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#D8CFDF] hover:text-white"
                                href={gift.urls.dashboard}
                            >
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Meus presentes
                            </Link>
                            <Link
                                className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#675578] bg-[#281D36] px-3 text-sm font-bold text-white hover:bg-[#3A2A48]"
                                href={gift.urls.preview}
                            >
                                <Eye aria-hidden="true" className="h-4 w-4" />
                                Preview
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
                    <div className="grid content-start gap-5">
                        <section
                            className="relative overflow-hidden rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-6 shadow-[0_9px_0_#CFC1AE,0_22px_40px_#1810241F]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                                backgroundSize: 'auto, 480px 480px',
                            }}
                        >
                            <span className="absolute right-8 top-0 h-7 w-24 -rotate-2 bg-[#C9A779]/75 shadow-sm" />
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Entrega</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#181024]">
                                    {gift.title}
                                </h1>
                                <GiftStatusBadge status={gift.status} />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-[#6F6877]">
                                {gift.recipient_name ? `Para ${gift.recipient_name}` : 'Sem destinatário'}
                                {gift.sender_name ? `, de ${gift.sender_name}` : ''}
                            </p>

                            {shareData ? (
                                <>
                                    <p className="mt-5 break-all border border-dashed border-[#A98BC4] bg-white px-3 py-3 text-sm text-[#6F6877]">
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
                                <div className="mt-5 rounded-[8px] border border-[#F2E1C8] bg-[#FFF1DD] p-4">
                                    <p className="text-sm font-semibold text-[#6F6877]">
                                        {share.status_message ?? 'Publique o presente para gerar QR Code.'}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[4px] border border-[#FF8E80] bg-[#FF705F] px-3 text-sm font-semibold text-[#181024] shadow-[inset_0_-2px_0_#D95045] hover:bg-[#FF8273]"
                                            href={gift.urls.review}
                                        >
                                            <Share2 aria-hidden="true" className="h-4 w-4" />
                                            Revisar publicação
                                        </Link>
                                        <Link
                                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#A98BC4] bg-white px-3 text-sm font-semibold text-[#6F6877] hover:bg-[#EFE9F3]"
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
