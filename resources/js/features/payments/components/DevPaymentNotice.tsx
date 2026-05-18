import { FlaskConical } from 'lucide-react';

type DevPaymentNoticeProps = {
    showApproveButton?: boolean;
    approving?: boolean;
    onApprove?: () => void;
};

export function DevPaymentNotice({ showApproveButton = false, approving = false, onApprove }: DevPaymentNoticeProps) {
    return (
        <section className="rounded-[8px] border border-[#7E8F68] bg-[#F2F5E8] p-4 text-sm text-[#48573A] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-start gap-3 font-semibold">
                    <FlaskConical aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    Pagamento real ainda não está integrado. Em ambiente local/teste, este pedido pode ser aprovado pelo
                    fluxo manual/dev controlado.
                </p>
                {showApproveButton ? (
                    <button
                        className="inline-flex min-h-10 items-center rounded-[6px] border border-[#7E8F68] bg-white px-3 text-sm font-semibold text-[#48573A] hover:bg-[#E7EBD8] disabled:cursor-not-allowed disabled:opacity-60"
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
