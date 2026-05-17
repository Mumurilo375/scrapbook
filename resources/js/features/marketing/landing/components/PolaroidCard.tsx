type PolaroidCardProps = {
    caption: string;
    className?: string;
    rotate?: 'left' | 'right' | 'none';
    tone?: 'rose' | 'kraft' | 'olive';
};

const rotateClasses = {
    left: '-rotate-3',
    none: 'rotate-0',
    right: 'rotate-3',
};

const toneClasses = {
    kraft: 'from-[#B78D5C] to-[#6F4226]',
    olive: 'from-[#D7DEC3] to-[#7E8F68]',
    rose: 'from-[#F2A79F] to-[#E66F65]',
};

export function PolaroidCard({ caption, className = '', rotate = 'left', tone = 'rose' }: PolaroidCardProps) {
    return (
        <div
            className={`w-28 rounded-[4px] border border-[#E5D0B8] bg-[#FFF7EE] p-2 pb-4 shadow-[0_14px_24px_#221C1929] sm:w-32 ${rotateClasses[rotate]} ${className}`}
        >
            <div className={`aspect-square rounded-[3px] bg-gradient-to-br ${toneClasses[tone]}`} />
            <p className="mt-2 truncate text-center font-hand text-lg leading-none text-[#42291D]">{caption}</p>
        </div>
    );
}
