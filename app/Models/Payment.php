<?php

namespace App\Models;

use App\Domain\Payments\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUlids;

    protected $fillable = [
        'order_id',
        'status',
        'provider',
        'provider_payment_id',
        'method',
        'currency',
        'amount_cents',
        'payload_json',
        'metadata',
        'approved_at',
        'refunded_at',
        'cancelled_at',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'status' => PaymentStatus::class,
            'amount_cents' => 'integer',
            'payload_json' => 'array',
            'metadata' => 'array',
            'approved_at' => 'datetime',
            'refunded_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }
}
