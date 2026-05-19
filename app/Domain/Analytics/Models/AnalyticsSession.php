<?php

namespace App\Domain\Analytics\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSession extends Model
{
    protected $fillable = [
        'session_uuid',
        'user_id',
        'first_seen_at',
        'last_seen_at',
        'entry_path',
        'current_path',
        'referrer',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'device_type',
        'browser',
        'os',
        'locale',
        'timezone',
        'screen_size_bucket',
        'ip_hash',
        'user_agent_hash',
        'metadata',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class, 'session_id');
    }

    protected function casts(): array
    {
        return [
            'first_seen_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'metadata' => 'array',
        ];
    }
}
