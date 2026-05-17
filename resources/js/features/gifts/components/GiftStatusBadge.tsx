import { humanStatus } from './formatters';

type GiftStatusBadgeProps = {
    status: string;
};

const statusClasses: Record<string, string> = {
    draft: 'border-[#c99a4a] bg-[#f6deb0] text-[#5d3a1e]',
    pending_payment: 'border-[#c9a982] bg-[#f1dfc8] text-[#6F4E37]',
    published: 'border-[#8D9A72] bg-[#e2e6d1] text-[#465234]',
    expired: 'border-[#8d8d8d] bg-[#ece7df] text-[#5f5a52]',
    disabled: 'border-[#8E2F2F] bg-[#f4d2cf] text-[#8E2F2F]',
};

export function GiftStatusBadge({ status }: GiftStatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                statusClasses[status] ?? statusClasses.draft
            }`}
        >
            {humanStatus(status)}
        </span>
    );
}
