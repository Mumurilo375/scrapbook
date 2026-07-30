import { humanStatus } from './formatters';

type GiftStatusBadgeProps = {
    status: string;
};

const statusClasses: Record<string, string> = {
    draft: 'border-[#C88743] bg-[#FFF1DF] text-[#6E3C12]',
    pending_payment: 'border-[#C9C1CD] bg-[#F0EBF4] text-[#342E38]',
    published: 'border-[#78A697] bg-[#E8F3EE] text-[#285B4E]',
    expired: 'border-[#B9B3BC] bg-[#EFEDF0] text-[#5C5660]',
    disabled: 'border-[#DE9E99] bg-[#FFF0F0] text-[#7E272E]',
};

export function GiftStatusBadge({ status }: GiftStatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-[4px] border px-2 py-0.5 text-[11px] font-bold ${
                statusClasses[status] ?? statusClasses.draft
            }`}
        >
            {humanStatus(status)}
        </span>
    );
}
