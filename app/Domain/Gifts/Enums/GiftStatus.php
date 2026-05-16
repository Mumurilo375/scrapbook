<?php

namespace App\Domain\Gifts\Enums;

enum GiftStatus: string
{
    case Draft = 'draft';
    case CheckoutPending = 'checkout_pending';
    case PaidUnpublished = 'paid_unpublished';
    case Published = 'published';
    case Disabled = 'disabled';
    case Expired = 'expired';
    case Deleted = 'deleted';
}
