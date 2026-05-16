<?php

namespace App\Domain\Media\Enums;

enum MediaStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Processed = 'processed';
    case Failed = 'failed';
}
