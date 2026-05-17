<?php

namespace App\Domain\Payments\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Paid = 'paid';
    case Canceled = 'canceled';
    case Expired = 'expired';
    case Refunded = 'refunded';
}
