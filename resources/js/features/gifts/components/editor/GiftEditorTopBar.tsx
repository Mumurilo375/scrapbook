import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck, CreditCard, ExternalLink, Eye, Gift, LogOut } from 'lucide-react';

import { GiftStatusBadge } from '../GiftStatusBadge';
import { EditorSaveStatus } from './EditorSaveStatus';
import type { SaveStatus } from './editorTypes';

type GiftEditorTopBarProps = {
    dashboardUrl: string;
    orderUrl: string | null;
    previewUrl: string;
    publicUrl: string | null;
    reviewUrl: string;
    saveDetail?: string | null;
    saveStatus: SaveStatus;
    status: string;
    title: string;
};

export function GiftEditorTopBar({
    dashboardUrl,
    orderUrl,
    previewUrl,
    publicUrl,
    reviewUrl,
    saveDetail,
    saveStatus,
    status,
    title,
}: GiftEditorTopBarProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <Link className="flex shrink-0 items-center gap-3 text-[#1F150A]" href="/">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                            <Gift aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="hidden font-editorial text-xl font-semibold sm:inline">Scrapbook</span>
                    </Link>
                    <div className="min-w-0 border-l border-[#D8B991] pl-3">
                        <p className="truncate text-sm font-semibold text-[#1F150A]">{title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <GiftStatusBadge status={status} />
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                    <EditorSaveStatus detail={saveDetail} status={saveStatus} />
                    <Link
                        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                        href={dashboardUrl}
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Meus presentes
                    </Link>
                    <Link
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                        href={previewUrl}
                    >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        Pré-visualizar
                    </Link>
                    {publicUrl ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={publicUrl}
                        >
                            <ExternalLink aria-hidden="true" className="h-4 w-4" />
                            Ver publicado
                        </Link>
                    ) : status === 'pending_payment' && orderUrl ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={orderUrl}
                        >
                            <CreditCard aria-hidden="true" className="h-4 w-4" />
                            Ver pedido
                        </Link>
                    ) : (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={reviewUrl}
                        >
                            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                            Revisar
                        </Link>
                    )}
                    <button
                        className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                        onClick={() => router.post('/logout')}
                        type="button"
                    >
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                        Sair
                    </button>
                </div>
            </div>
        </header>
    );
}
