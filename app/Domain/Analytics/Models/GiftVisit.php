<?php

namespace App\Domain\Analytics\Models;

use App\Domain\Gifts\Models\Gift;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftVisit extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'session_hash',
        'ip_hash',
        'user_agent_hash',
        'referrer',
        'opened_at',
        'metadata',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
