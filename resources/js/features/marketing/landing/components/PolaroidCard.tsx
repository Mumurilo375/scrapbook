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
    kraft: 'from-[#4B3D59] to-[#43283D]',
    olive: 'from-[#C8DCCA] to-[#73A58E]',
    rose: 'from-[#FFA79C] to-[#FF705F]',
};

export function PolaroidCard({ caption, className = '', rotate = 'left', tone = 'rose' }: PolaroidCardProps) {
    return (
        <div
            className={`w-28 rounded-[3px] border border-[#D6CFDD] bg-[#FBF7ED] p-2 pb-4 shadow-[0_14px_24px_#18102429] sm:w-32 ${rotateClasses[rotate]} ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(rgba(251,247,237,.86),rgba(251,247,237,.86)),url('/materials/cotton-paper.webp')",
                backgroundSize: 'auto, 320px 320px',
            }}
        >
            <div className={`aspect-square rounded-[3px] bg-gradient-to-br ${toneClasses[tone]}`} />
            <p className="mt-2 truncate text-center font-hand text-lg leading-none text-[#6F6877]">{caption}</p>
        </div>
    );
}
