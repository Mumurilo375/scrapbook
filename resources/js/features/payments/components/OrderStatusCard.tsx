import { CheckCircle2, Clock, ExternalLink, Receipt } from 'lucide-react';
import { Link } from '@inertiajs/react';

import { formatDate, formatPrice, humanStatus } from '../../gifts/components/formatters';
import type { CheckoutOrderSummary, OrderShowData } from '../types';

type OrderStatusCardProps = {
    order: CheckoutOrderSummary | OrderShowData;
    publicUrl?: string | null;
};

export function OrderStatusCard({ order, publicUrl = null }: OrderStatusCardProps) {
    const paid = order.status === 'paid' || order.payment_status === 'approved';

    return (
        <section
            className="relative overflow-hidden rounded-[10px] border border-[#C9BAD8] bg-[#FBF7ED] p-5 shadow-[0_9px_0_#CFC1AE,0_20px_38px_#18102418]"
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.88),rgba(251,247,237,.88)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 460px 460px',
            }}
        >
            <span
                aria-hidden="true"
                className="absolute left-0 right-0 top-16 border-t border-dashed border-[#C9BAD8]"
            />
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D95045]">Pedido</p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-[#181024]">
                        {humanOrderStatus(order.status)}
                    </h2>
                    <p className="mt-2 text-sm text-[#6F6877]">
                        Pagamento: <strong>{humanPaymentStatus(order.payment_status)}</strong>
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                        paid
                            ? 'border-[#73A58E] bg-[#E8F2ED] text-[#2E6856]'
                            : 'border-[#B8792E] bg-[#F2E1C8] text-[#6F6877]'
                    }`}
                >
                    {paid ? (
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    ) : (
                        <Clock aria-hidden="true" className="h-4 w-4" />
                    )}
                    {paid ? 'Pago' : 'Pendente'}
                </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm text-[#6F6877] sm:grid-cols-3">
                <Info label="Valor" value={formatPrice(order.amount_cents, order.currency)} />
                <Info label="Forma de confirmação" value={paymentProviderLabel(order.provider)} />
                <Info label="Expira em" value={formatDate(order.expires_at)} />
            </dl>

            {publicUrl ? (
                <Link
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#73A58E] bg-[#E8F2ED] px-3 text-sm font-semibold text-[#2E6856] hover:bg-[#DCE4CB]"
                    href={publicUrl}
                >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    Abrir link público
                </Link>
            ) : (
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6F6877]">
                    <Receipt aria-hidden="true" className="h-4 w-4" />O link público aparece automaticamente depois do
                    pagamento aprovado.
                </p>
            )}
        </section>
    );
}

type InfoProps = {
    label: string;
    value: string;
};

function Info({ label, value }: InfoProps) {
    return (
        <div className="border-b border-[#D6CFDD] bg-white/65 px-3 py-3 last:border-b-0">
            <dt className="font-semibold text-[#181024]">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
        </div>
    );
}

function humanOrderStatus(status: string): string {
    const labels: Record<string, string> = {
        draft: 'Pedido em rascunho',
        pending: 'Pedido pendente',
        paid: 'Pedido pago',
        canceled: 'Pedido cancelado',
        expired: 'Pedido expirado',
        refunded: 'Pedido estornado',
    };

    return labels[status] ?? humanStatus(status);
}

function humanPaymentStatus(status: string): string {
    const labels: Record<string, string> = {
        pending: 'pendente',
        approved: 'aprovado',
        rejected: 'rejeitado',
        canceled: 'cancelado',
        refunded: 'estornado',
    };

    return labels[status] ?? status;
}

function paymentProviderLabel(provider: string | null): string {
    if (!provider) {
        return 'A definir';
    }

    if (provider === 'manual_dev') {
        return 'Aprovação interna';
    }

    return 'Confirmação externa';
}
