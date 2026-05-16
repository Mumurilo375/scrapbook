<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'price_cents',
        'currency',
        'duration_days',
        'limits_json',
        'features_json',
        'sort_order',
        'is_featured',
        'is_active',
    ];

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'duration_days' => 'integer',
            'limits_json' => 'array',
            'features_json' => 'array',
            'sort_order' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
