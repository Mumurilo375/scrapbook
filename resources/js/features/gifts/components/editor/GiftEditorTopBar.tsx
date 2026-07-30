import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck, CreditCard, Eye, Gift, LogOut, Share2 } from 'lucide-react';

import { humanStatus } from '../formatters';
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
    const giftStatusClassName =
        status === 'published'
            ? 'text-[#8CD7C1]'
            : status === 'pending_payment'
              ? 'text-[#F0B875]'
              : status === 'disabled'
                ? 'text-[#FF9C8A]'
                : 'text-[#CFC3D7]';
    const utilityActionClassName =
        'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[5px] border border-[#4B3A58] bg-[#2A1D36] px-3 text-sm font-bold text-[#F8F5FA] transition-colors hover:border-[#6B557B] hover:bg-[#382943] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF765B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#21162D]';
    const finalActionClassName =
        'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[5px] border border-[#FF9B88] bg-[#FF765B] px-3 text-sm font-bold text-[#21162D] shadow-[inset_0_-2px_0_#C94E3A] transition-colors hover:bg-[#FF8A72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#21162D]';

    return (
        <header className="sticky top-0 z-40 border-b border-[#3B2D47] bg-[#21162D] text-[#F8F5FA] shadow-[0_4px_16px_rgba(18,10,25,0.14)]">
            <div className="mx-auto grid max-w-[1680px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 px-3 py-2 sm:px-5 lg:min-h-16 lg:grid-cols-[auto_minmax(12rem,1fr)_auto_auto] lg:gap-x-3 lg:px-6">
                <nav
                    aria-label="Navegação do editor"
                    className="col-start-1 row-start-1 flex shrink-0 items-center gap-1"
                >
                    <Link
                        aria-label="Ir para a página inicial do Scrapbook"
                        className="group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[5px] px-1 text-[#F8F5FA] transition-colors hover:bg-[#30223C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF765B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#21162D] 2xl:px-2"
                        href="/"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#594666] bg-[#2A1D36] text-[#FF8A72] transition-colors group-hover:border-[#755E85]">
                            <Gift aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="hidden font-display text-sm font-bold 2xl:inline">Scrapbook</span>
                    </Link>

                    <span aria-hidden="true" className="mx-1 h-7 w-px bg-[#4D3B59]" />

                    <Link
                        aria-label="Voltar para meus presentes"
                        className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[5px] px-2 text-sm font-bold text-[#D8CEDF] transition-colors hover:bg-[#30223C] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF765B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#21162D]"
                        href={dashboardUrl}
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        <span className="hidden xl:inline">Meus presentes</span>
                    </Link>
                </nav>

                <div className="col-start-2 row-start-1 min-w-0 border-l border-[#4D3B59] pl-3">
                    <div
                        className={`flex items-center gap-1.5 text-[0.625rem] font-bold uppercase leading-none tracking-[0.12em] ${giftStatusClassName}`}
                    >
                        <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-current" />
                        <span>Presente</span>
                        <span aria-hidden="true" className="text-[#806F8B]">
                            /
                        </span>
                        <span className="truncate">{humanStatus(status)}</span>
                    </div>
                    <h1 className="mt-1 truncate font-display text-sm font-bold leading-tight tracking-[-0.01em] text-white sm:text-base">
                        {title}
                    </h1>
                </div>

                <div className="gift-editor-topbar-actions col-span-3 col-start-1 row-start-2 -mx-3 mt-2 flex snap-x items-center gap-2 overflow-x-auto border-t border-[#3B2D47] px-3 pt-2 sm:-mx-5 sm:px-5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:m-0 lg:overflow-visible lg:border-0 lg:p-0">
                    <EditorSaveStatus detail={saveDetail} status={saveStatus} />
                    <EditorHistoryControls
                        canRedo={canRedo}
                        canUndo={canUndo}
                        disabled={historyDisabled}
                        onRedo={onRedo}
                        onUndo={onUndo}
                    />

                    <span aria-hidden="true" className="h-7 w-px shrink-0 bg-[#4D3B59]" />

                    <Link className={`${utilityActionClassName} snap-start`} href={previewUrl}>
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        Visualizar
                    </Link>

                    <button
                        aria-label="Sair da conta"
                        className={`${utilityActionClassName} snap-start`}
                        onClick={() => router.post('/logout')}
                        title="Sair da conta"
                        type="button"
                    >
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                        <span className="lg:hidden 2xl:inline">Sair</span>
                    </button>
                </div>

                <div className="col-start-3 row-start-1 ml-1 lg:col-start-4">
                    {shareUrl ? (
                        <Link aria-label="Compartilhar presente" className={finalActionClassName} href={shareUrl}>
                            <Share2 aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden min-[480px]:inline">Compartilhar</span>
                        </Link>
                    ) : status === 'pending_payment' && orderUrl ? (
                        <Link aria-label="Ver pedido" className={finalActionClassName} href={orderUrl}>
                            <CreditCard aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden min-[480px]:inline">Ver pedido</span>
                        </Link>
                    ) : (
                        <Link aria-label="Revisar presente" className={finalActionClassName} href={reviewUrl}>
                            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
                            <span className="hidden min-[480px]:inline">Revisar</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
