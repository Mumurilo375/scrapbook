<?php

namespace App\Domain\Templates\Models;

use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Templates\Enums\PageType;
use Database\Factories\TemplatePageFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplatePage extends Model
{
    /** @use HasFactory<TemplatePageFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'template_version_id',
        'page_type',
        'name',
        'sort_order',
        'canvas',
        'editable_schema',
        'constraints',
        'metadata',
    ];

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class);
    }

    public function giftPages(): HasMany
    {
        return $this->hasMany(GiftPage::class, 'source_template_page_id');
    }

    protected static function newFactory(): TemplatePageFactory
    {
        return TemplatePageFactory::new();
    }

    protected function casts(): array
    {
        return [
            'page_type' => PageType::class,
            'sort_order' => 'integer',
            'canvas' => 'array',
            'editable_schema' => 'array',
            'constraints' => 'array',
            'metadata' => 'array',
        ];
    }
}
