<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GiftVisit extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'visitor_hash',
        'ip_hash',
        'user_agent_hash',
        'referrer',
        'country',
        'metadata',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(GiftEvent::class);
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
