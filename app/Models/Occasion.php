<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Occasion extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'sort_order',
        'is_active',
        'settings',
    ];

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
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
