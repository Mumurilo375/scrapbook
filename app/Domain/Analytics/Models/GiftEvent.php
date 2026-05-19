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
        'gift_visit_id',
        'analytics_session_id',
        'user_id',
        'event_name',
        'event_type',
        'page_index',
        'page_id',
        'element_id',
        'element_type',
        'payload',
        'metadata',
        'occurred_at',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function giftVisit(): BelongsTo
    {
        return $this->belongsTo(GiftVisit::class);
    }

    public function analyticsSession(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'metadata' => 'array',
            'page_index' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }
}
