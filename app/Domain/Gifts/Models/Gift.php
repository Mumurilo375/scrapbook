<?php

namespace App\Domain\Gifts\Models;

use App\Domain\Analytics\Models\GiftEvent;
use App\Domain\Analytics\Models\GiftVisit;
use App\Domain\Gifts\Enums\GiftStatus;
use App\Domain\Gifts\Enums\GiftVisibility;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Carbon\CarbonInterface;
use Database\Factories\GiftFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Gift extends Model
{
    /** @use HasFactory<GiftFactory> */
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'plan_id',
        'occasion_id',
        'template_version_id',
        'theme_version_id',
        'title',
        'slug',
        'public_code',
        'status',
        'visibility',
        'recipient_name',
        'sender_name',
        'cover_media_id',
        'settings',
        'limits_snapshot',
        'published_at',
        'expires_at',
        'last_edited_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
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

    public function coverMedia(): BelongsTo
    {
        return $this->belongsTo(MediaItem::class, 'cover_media_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(GiftPage::class)->orderBy('sort_order');
    }

    public function mediaItems(): HasMany
    {
        return $this->hasMany(MediaItem::class);
    }

    public function musicSelection(): HasOne
    {
        return $this->hasOne(MusicSelection::class);
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

    public function scopePubliclyAccessible(Builder $query): Builder
    {
        return $query
            ->where('status', GiftStatus::Published->value)
            ->where('visibility', GiftVisibility::PublicLink->value)
            ->whereNotNull('public_code')
            ->where(function (Builder $query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    public function isPubliclyAccessible(): bool
    {
        $expiresAt = $this->getAttribute('expires_at');

        return $this->statusEnum() === GiftStatus::Published
            && $this->visibilityEnum() === GiftVisibility::PublicLink
            && $this->public_code !== null
            && ($expiresAt === null || ($expiresAt instanceof CarbonInterface && $expiresAt->isFuture()));
    }

    public function statusEnum(): GiftStatus
    {
        $status = $this->getAttribute('status');

        return $status instanceof GiftStatus ? $status : GiftStatus::from((string) $status);
    }

    public function visibilityEnum(): GiftVisibility
    {
        $visibility = $this->getAttribute('visibility');

        return $visibility instanceof GiftVisibility ? $visibility : GiftVisibility::from((string) $visibility);
    }

    protected static function newFactory(): GiftFactory
    {
        return GiftFactory::new();
    }

    protected function casts(): array
    {
        return [
            'status' => GiftStatus::class,
            'visibility' => GiftVisibility::class,
            'settings' => 'array',
            'limits_snapshot' => 'array',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
            'last_edited_at' => 'datetime',
        ];
    }
}
