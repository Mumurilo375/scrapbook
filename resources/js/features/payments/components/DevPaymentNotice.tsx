import { FlaskConical } from 'lucide-react';

type DevPaymentNoticeProps = {
    showApproveButton?: boolean;
    approving?: boolean;
    onApprove?: () => void;
};

export function DevPaymentNotice({ showApproveButton = false, approving = false, onApprove }: DevPaymentNoticeProps) {
    return (
        <section className="border border-[#73A58E] bg-[#EEF7F2] p-4 text-sm text-[#2E6856] shadow-[4px_5px_0_#B8D3C6] [clip-path:polygon(0_0,calc(100%_-_9px)_0,100%_9px,100%_100%,0_100%)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-start gap-3 font-semibold">
                    <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    Pagamento real ainda não está integrado. Em ambiente local/teste, este pedido pode ser aprovado pelo
                    fluxo manual/dev controlado.
                </p>
                {showApproveButton ? (
                    <button
                        className="inline-flex min-h-10 items-center rounded-[4px] border border-[#73A58E] bg-white px-3 text-sm font-bold text-[#2E6856] hover:bg-[#E8F2ED] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={approving}
                        onClick={onApprove}
                        type="button"
                    >
                        {approving ? 'Aprovando...' : 'Aprovar em dev'}
                    </button>
                ) : null}
            </div>
        </section>
    );
}
