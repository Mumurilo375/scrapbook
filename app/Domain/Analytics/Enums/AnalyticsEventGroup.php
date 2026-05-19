<?php

namespace App\Domain\Analytics\Enums;

enum AnalyticsEventGroup: string
{
    case Marketing = 'marketing';
    case Creation = 'creation';
    case Auth = 'auth';
    case Editor = 'editor';
    case Media = 'media';
    case Template = 'template';
    case Checkout = 'checkout';
    case Payment = 'payment';
    case Publication = 'publication';
    case Share = 'share';
    case Viewer = 'viewer';
    case Admin = 'admin';
    case System = 'system';
    case Error = 'error';
}
