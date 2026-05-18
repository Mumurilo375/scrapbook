import { AlertTriangle } from 'lucide-react';

export function PaymentPendingNotice() {
    return (
        <section className="rounded-[8px] border border-[#BD8558] bg-[#EBC493] p-4 text-sm text-[#42291D] shadow-sm">
            <p className="flex items-start gap-3 font-semibold">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />O presente ainda não está público
                porque o pagamento está pendente.
            </p>
        </section>
    );
}
