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
    kraft: 'from-[#c9a982] to-[#8d674b]',
    olive: 'from-[#c8d0ad] to-[#8D9A72]',
    rose: 'from-[#f1b9b4] to-[#C96F72]',
};

export function PolaroidCard({ caption, className = '', rotate = 'left', tone = 'rose' }: PolaroidCardProps) {
    return (
        <div
            className={`w-28 rounded-[4px] border border-[#ead8bf] bg-[#fffaf2] p-2 pb-4 shadow-[0_14px_24px_rgba(58,36,24,0.16)] sm:w-32 ${rotateClasses[rotate]} ${className}`}
        >
            <div className={`aspect-square rounded-[3px] bg-gradient-to-br ${toneClasses[tone]}`} />
            <p className="mt-2 truncate text-center font-hand text-lg leading-none text-[#6F4E37]">{caption}</p>
        </div>
    );
}
