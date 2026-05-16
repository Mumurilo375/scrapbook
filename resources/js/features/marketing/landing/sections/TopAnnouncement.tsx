import { Heart } from 'lucide-react';

import { announcement } from '../landingData';

export function TopAnnouncement() {
    return (
        <div className="border-b border-[#dcc19b] bg-[#ead7bb] text-[#3A2418]">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium sm:px-6 lg:px-8">
                <Heart aria-hidden="true" className="h-4 w-4 fill-[#8E2F2F] text-[#8E2F2F]" />
                <span>{announcement}</span>
            </div>
        </div>
    );
}
