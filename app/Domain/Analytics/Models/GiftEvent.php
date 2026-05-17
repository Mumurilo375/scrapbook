<?php

namespace App\Domain\Analytics\Models;

use App\Domain\Gifts\Models\Gift;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftEvent extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'user_id',
        'event_type',
        'payload',
        'occurred_at',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
