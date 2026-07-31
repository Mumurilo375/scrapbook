import { Heart } from 'lucide-react';

import { announcement } from '../landingData';

export function TopAnnouncement() {
    return (
        <div className="border-b border-[#D95045] bg-[#FF705F] text-[#181024]">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-sm font-bold sm:px-6 lg:px-8">
                <Heart aria-hidden="true" className="h-4 w-4 fill-[#181024] text-[#181024]" />
                <span>{announcement}</span>
            </div>
        </div>
    );
}
