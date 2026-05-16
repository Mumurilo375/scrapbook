<?php

namespace App\Domain\Templates\Enums;

enum TemplateVersionStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
