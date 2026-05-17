<?php

namespace App\Domain\Payments\Models;

use App\Domain\Gifts\Models\Gift;
use Database\Factories\PlanFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<PlanFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_cents',
        'currency',
        'max_pages',
        'max_photos',
        'max_storage_mb',
        'gift_lifetime_days',
        'can_use_qr_code',
        'can_edit_after_publish',
        'features',
        'is_active',
        'sort_order',
    ];

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function limitsSnapshot(): array
    {
        return [
            'max_pages' => $this->max_pages,
            'max_photos' => $this->max_photos,
            'max_storage_mb' => $this->max_storage_mb,
            'gift_lifetime_days' => $this->gift_lifetime_days,
            'can_use_qr_code' => $this->can_use_qr_code,
            'can_edit_after_publish' => $this->can_edit_after_publish,
        ];
    }

    protected static function newFactory(): PlanFactory
    {
        return PlanFactory::new();
    }

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer',
            'max_pages' => 'integer',
            'max_photos' => 'integer',
            'max_storage_mb' => 'integer',
            'gift_lifetime_days' => 'integer',
            'can_use_qr_code' => 'boolean',
            'can_edit_after_publish' => 'boolean',
            'features' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
