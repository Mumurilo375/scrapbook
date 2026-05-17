<?php

namespace App\Domain\Gifts\Enums;

enum GiftVisibility: string
{
    case Private = 'private';
    case PublicLink = 'public_link';
}
