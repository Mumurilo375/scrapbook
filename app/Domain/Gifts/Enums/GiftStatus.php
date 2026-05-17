<?php

namespace App\Domain\Gifts\Enums;

enum GiftStatus: string
{
    case Draft = 'draft';
    case PendingPayment = 'pending_payment';
    case Published = 'published';
    case Expired = 'expired';
    case Disabled = 'disabled';
}
