<?php

namespace App\Domain\Templates\Enums;

enum PageType: string
{
    case Cover = 'cover';
    case Letter = 'letter';
    case Gallery = 'gallery';
    case Music = 'music';
    case Final = 'final';
    case Generic = 'generic';
}
