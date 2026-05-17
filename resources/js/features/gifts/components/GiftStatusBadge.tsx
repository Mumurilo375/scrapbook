import { humanStatus } from './formatters';

type GiftStatusBadgeProps = {
    status: string;
};

const statusClasses: Record<string, string> = {
    draft: 'border-[#BD8558] bg-[#EBC493] text-[#42291D]',
    pending_payment: 'border-[#B78D5C] bg-[#EAD2B8] text-[#42291D]',
    published: 'border-[#7E8F68] bg-[#E7EBD8] text-[#48573A]',
    expired: 'border-[#8d8d8d] bg-[#E8DFD6] text-[#5B4B42]',
    disabled: 'border-[#D93632] bg-[#F8D8D3] text-[#D93632]',
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
