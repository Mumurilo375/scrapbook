export function formatDate(value: string | null | undefined): string {
    if (!value) {
        return 'Sem data';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function formatPrice(priceCents: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(priceCents / 100);
}

export function humanStatus(status: string): string {
    const labels: Record<string, string> = {
        draft: 'Rascunho',
        pending_payment: 'Pagamento pendente',
        published: 'Publicado',
        expired: 'Expirado',
        disabled: 'Desativado',
    };

    return labels[status] ?? status;
}
