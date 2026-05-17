<?php

namespace App\Domain\Templates\Models;

use App\Domain\Gifts\Models\Gift;
use Database\Factories\OccasionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Occasion extends Model
{
    /** @use HasFactory<OccasionFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
        'sort_order',
        'metadata',
    ];

    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    protected static function newFactory(): OccasionFactory
    {
        return OccasionFactory::new();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'metadata' => 'array',
        ];
    }
}
