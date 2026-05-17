<?php

namespace App\Domain\Gifts\Models;

use App\Domain\Templates\Enums\PageType;
use App\Domain\Templates\Models\TemplatePage;
use Database\Factories\GiftPageFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftPage extends Model
{
    /** @use HasFactory<GiftPageFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'gift_id',
        'source_template_page_id',
        'page_type',
        'name',
        'sort_order',
        'canvas',
        'settings',
        'is_visible',
        'locked',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function sourceTemplatePage(): BelongsTo
    {
        return $this->belongsTo(TemplatePage::class, 'source_template_page_id');
    }

    protected static function newFactory(): GiftPageFactory
    {
        return GiftPageFactory::new();
    }

    protected function casts(): array
    {
        return [
            'page_type' => PageType::class,
            'sort_order' => 'integer',
            'canvas' => 'array',
            'settings' => 'array',
            'is_visible' => 'boolean',
            'locked' => 'boolean',
        ];
    }
}
