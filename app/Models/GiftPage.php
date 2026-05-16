<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GiftPage extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'template_page_id',
        'position',
        'title',
        'canvas_json',
        'content_json',
        'settings',
        'is_visible',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function templatePage(): BelongsTo
    {
        return $this->belongsTo(TemplatePage::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(GiftEvent::class);
    }

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'canvas_json' => 'array',
            'content_json' => 'array',
            'settings' => 'array',
            'is_visible' => 'boolean',
        ];
    }
}
