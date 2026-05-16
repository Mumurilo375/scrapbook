<?php

namespace App\Models;

use App\Domain\Gifts\Enums\GiftStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gift extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'occasion_id',
        'template_version_id',
        'theme_version_id',
        'plan_id',
        'status',
        'slug',
        'public_token_hash',
        'title',
        'recipient_name',
        'sender_name',
        'message',
        'settings',
        'metadata',
        'last_activity_at',
        'published_at',
        'expires_at',
        'disabled_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class);
    }

    public function themeVersion(): BelongsTo
    {
        return $this->belongsTo(ThemeVersion::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(GiftPage::class)->orderBy('position');
    }

    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(GiftVisit::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(GiftEvent::class);
    }

    protected function casts(): array
    {
        return [
            'status' => GiftStatus::class,
            'settings' => 'array',
            'metadata' => 'array',
            'last_activity_at' => 'datetime',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
            'disabled_at' => 'datetime',
        ];
    }
}
