import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck, CreditCard, Eye, Gift, LogOut, Share2 } from 'lucide-react';

import { GiftStatusBadge } from '../GiftStatusBadge';
import { EditorHistoryControls } from './EditorHistoryControls';
import { EditorSaveStatus } from './EditorSaveStatus';
import type { SaveStatus } from './editorTypes';

type GiftEditorTopBarProps = {
    canRedo: boolean;
    canUndo: boolean;
    dashboardUrl: string;
    historyDisabled: boolean;
    onRedo: () => void;
    onUndo: () => void;
    orderUrl: string | null;
    previewUrl: string;
    reviewUrl: string;
    saveDetail?: string | null;
    saveStatus: SaveStatus;
    shareUrl: string | null;
    status: string;
    title: string;
};

export function GiftEditorTopBar({
    canRedo,
    canUndo,
    dashboardUrl,
    historyDisabled,
    onRedo,
    onUndo,
    orderUrl,
    previewUrl,
    reviewUrl,
    saveDetail,
    saveStatus,
    shareUrl,
    status,
    title,
}: GiftEditorTopBarProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-[#D8B991] bg-[#F4E8D9]/95 backdrop-blur">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
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

                <div className="-mx-1 flex w-[calc(100%+0.5rem)] items-center gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0">
                    <EditorSaveStatus detail={saveDetail} status={saveStatus} />
                    <EditorHistoryControls
                        canRedo={canRedo}
                        canUndo={canUndo}
                        disabled={historyDisabled}
                        onRedo={onRedo}
                        onUndo={onUndo}
                    />
                    <Link
                        className="inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-[#42291D]"
                        href={dashboardUrl}
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Meus presentes
                    </Link>
                    <Link
                        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                        href={previewUrl}
                    >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        Pré-visualizar
                    </Link>
                    {shareUrl ? (
                        <Link
                            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={shareUrl}
                        >
                            <Share2 aria-hidden="true" className="h-4 w-4" />
                            Compartilhar
                        </Link>
                    ) : status === 'pending_payment' && orderUrl ? (
                        <Link
                            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={orderUrl}
                        >
                            <CreditCard aria-hidden="true" className="h-4 w-4" />
                            Ver pedido
                        </Link>
                    ) : (
                        <Link
                            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#8F211F] bg-[#D93632] px-3 text-sm font-semibold text-[#FFF7EE] hover:bg-[#B92827]"
                            href={reviewUrl}
                        >
                            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                            Revisar
                        </Link>
                    )}
                    <button
                        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-white px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
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
