<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplatePage extends Model
{
    use HasUlids;

    protected $fillable = [
        'template_version_id',
        'slug',
        'name',
        'page_type',
        'position',
        'canvas_json',
        'editable_slots',
        'interaction_config',
        'settings',
        'is_required',
        'is_repeatable',
        'min_instances',
        'max_instances',
    ];

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class);
    }

    public function giftPages(): HasMany
    {
        return $this->hasMany(GiftPage::class);
    }

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'canvas_json' => 'array',
            'editable_slots' => 'array',
            'interaction_config' => 'array',
            'settings' => 'array',
            'is_required' => 'boolean',
            'is_repeatable' => 'boolean',
            'min_instances' => 'integer',
            'max_instances' => 'integer',
        ];
    }
}
