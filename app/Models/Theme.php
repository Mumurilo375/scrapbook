<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Theme extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'preview_image_url',
        'sort_order',
        'is_active',
        'settings',
    ];

    public function versions(): HasMany
    {
        return $this->hasMany(ThemeVersion::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class, 'default_theme_id');
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
