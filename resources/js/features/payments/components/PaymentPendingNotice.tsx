import { AlertTriangle } from 'lucide-react';

export function PaymentPendingNotice() {
    return (
        <section className="border border-[#B8792E] bg-[#F2E1C8] p-4 text-sm text-[#5E421F] shadow-[4px_5px_0_#D9C29F] [clip-path:polygon(0_0,calc(100%_-_9px)_0,100%_9px,100%_100%,0_100%)]">
            <p className="flex items-start gap-3 font-semibold">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />O presente ainda não está
                público porque o pagamento está pendente.
            </p>
        </section>
    );
}
