import {
    BadgeCheck,
    BookOpen,
    Cake,
    Camera,
    Gift,
    Heart,
    Image,
    Link,
    Mail,
    MapPin,
    Music,
    Palette,
    PenLine,
    Puzzle,
    QrCode,
    Smartphone,
    Sparkles,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { IconKey } from '../landingData';

export const landingIcons: Record<IconKey, LucideIcon> = {
    badge: BadgeCheck,
    book: BookOpen,
    cake: Cake,
    camera: Camera,
    gift: Gift,
    heart: Heart,
    image: Image,
    link: Link,
    mail: Mail,
    map: MapPin,
    music: Music,
    palette: Palette,
    pen: PenLine,
    phone: Smartphone,
    puzzle: Puzzle,
    qr: QrCode,
    sparkles: Sparkles,
    users: Users,
};
