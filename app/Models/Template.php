<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Template extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'occasion_id',
        'default_theme_id',
        'slug',
        'name',
        'description',
        'cover_image_url',
        'sort_order',
        'is_active',
        'settings',
    ];

    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    public function defaultTheme(): BelongsTo
    {
        return $this->belongsTo(Theme::class, 'default_theme_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class);
    }

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }
}
