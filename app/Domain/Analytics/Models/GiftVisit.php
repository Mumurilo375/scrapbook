<?php

namespace App\Domain\Analytics\Models;

use App\Domain\Gifts\Models\Gift;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GiftVisit extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'visit_uuid',
        'analytics_session_id',
        'public_source',
        'session_hash',
        'ip_hash',
        'user_agent_hash',
        'device_type',
        'browser',
        'os',
        'referrer',
        'opened_at',
        'completed_at',
        'page_views_count',
        'interactions_count',
        'metadata',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function analyticsSession(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(GiftEvent::class);
    }

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'completed_at' => 'datetime',
            'page_views_count' => 'integer',
            'interactions_count' => 'integer',
            'metadata' => 'array',
        ];
    }
}
