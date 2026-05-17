import { Heart } from 'lucide-react';

import { announcement } from '../landingData';

export function TopAnnouncement() {
    return (
        <div className="border-b border-[#B78D5C] bg-[#B78D5C] text-[#1F150A]">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium sm:px-6 lg:px-8">
                <Heart aria-hidden="true" className="h-4 w-4 fill-[#D93632] text-[#D93632]" />
                <span>{announcement}</span>
            </div>
        </div>
    );
}
