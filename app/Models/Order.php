<?php

namespace App\Models;

use App\Domain\Payments\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'gift_id',
        'plan_id',
        'number',
        'status',
        'provider',
        'provider_reference',
        'currency',
        'subtotal_cents',
        'discount_cents',
        'total_cents',
        'price_snapshot',
        'limits_snapshot',
        'metadata',
        'expires_at',
        'paid_at',
        'cancelled_at',
        'refunded_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal_cents' => 'integer',
            'discount_cents' => 'integer',
            'total_cents' => 'integer',
            'price_snapshot' => 'array',
            'limits_snapshot' => 'array',
            'metadata' => 'array',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }
}
