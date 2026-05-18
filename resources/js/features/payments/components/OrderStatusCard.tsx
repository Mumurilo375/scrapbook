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
        <section className="rounded-[8px] border border-[#D8B991] bg-[#FFF7EE] p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="font-editorial text-xs font-semibold uppercase text-[#D93632]">Pedido</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#1F150A]">{humanOrderStatus(order.status)}</h2>
                    <p className="mt-2 text-sm text-[#6F5A4A]">
                        Pagamento: <strong>{humanPaymentStatus(order.payment_status)}</strong>
                    </p>
                </div>
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                        paid
                            ? 'border-[#7E8F68] bg-[#E7EBD8] text-[#48573A]'
                            : 'border-[#BD8558] bg-[#EBC493] text-[#42291D]'
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

            <dl className="mt-5 grid gap-3 text-sm text-[#42291D] sm:grid-cols-3">
                <Info label="Valor" value={formatPrice(order.amount_cents, order.currency)} />
                <Info label="Forma de confirmação" value={paymentProviderLabel(order.provider)} />
                <Info label="Expira em" value={formatDate(order.expires_at)} />
            </dl>

            {publicUrl ? (
                <Link
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[6px] border border-[#7E8F68] bg-[#E7EBD8] px-3 text-sm font-semibold text-[#48573A] hover:bg-[#DCE4CB]"
                    href={publicUrl}
                >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    Abrir link público
                </Link>
            ) : (
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6F5A4A]">
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
        <div className="rounded-[6px] border border-[#E5D0B8] bg-white px-3 py-3">
            <dt className="font-semibold text-[#1F150A]">{label}</dt>
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
