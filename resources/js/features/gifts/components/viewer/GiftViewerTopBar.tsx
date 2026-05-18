import { Link } from '@inertiajs/react';
import { ArrowLeft, Gift, PenLine, Plus } from 'lucide-react';

type GiftViewerTopBarProps = {
    createUrl: string;
    editUrl?: string | null;
    mode: 'preview' | 'public';
    status?: string;
    title: string;
};

export function GiftViewerTopBar({ createUrl, editUrl = null, mode, status, title }: GiftViewerTopBarProps) {
    return (
        <header className="sticky top-0 z-30 -mx-4 border-b border-[#D8B991] bg-[#F4E8D9]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Link className="flex shrink-0 items-center gap-3 text-[#1F150A]" href="/">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B78D5C] bg-[#FFF7EE] text-[#D93632]">
                            <Gift aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="hidden font-editorial text-xl font-semibold sm:inline">Scrapbook</span>
                    </Link>
                    <div className="min-w-0 border-l border-[#D8B991] pl-3">
                        <p className="truncate text-sm font-semibold text-[#1F150A]">{title}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-[#7A2634]">
                            {mode === 'preview' ? `Preview privado${status ? ` - ${status}` : ''}` : 'Presente digital'}
                        </p>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
                    {mode === 'preview' && editUrl ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                            href={editUrl}
                        >
                            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                            Voltar para editar
                        </Link>
                    ) : (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#CBA980] bg-[#FFF7EE] px-3 text-sm font-semibold text-[#42291D] hover:bg-[#EAD2B8]"
                            href={createUrl}
                        >
                            <Plus aria-hidden="true" className="h-4 w-4" />
                            Criar o meu também
                        </Link>
                    )}

                    {mode === 'preview' && editUrl ? (
                        <Link
                            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#42291D]"
                            href={editUrl}
                        >
                            <PenLine aria-hidden="true" className="h-4 w-4" />
                            Editar
                        </Link>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
