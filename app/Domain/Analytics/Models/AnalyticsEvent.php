<?php

namespace App\Domain\Analytics\Models;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Payments\Models\Order;
use App\Domain\Payments\Models\Payment;
use App\Domain\Payments\Models\Plan;
use App\Domain\Templates\Models\Occasion;
use App\Domain\Templates\Models\Template;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Models\Theme;
use App\Domain\Themes\Models\ThemeVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsEvent extends Model
{
    use HasUlids;

    protected $fillable = [
        'event_uuid',
        'session_id',
        'user_id',
        'gift_id',
        'order_id',
        'payment_id',
        'plan_id',
        'template_id',
        'template_version_id',
        'theme_id',
        'theme_version_id',
        'occasion_id',
        'event_name',
        'event_group',
        'occurred_at',
        'source',
        'path',
        'referrer',
        'payload',
        'metadata',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class);
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function themeVersion(): BelongsTo
    {
        return $this->belongsTo(ThemeVersion::class);
    }

    public function occasion(): BelongsTo
    {
        return $this->belongsTo(Occasion::class);
    }

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'payload' => 'array',
            'metadata' => 'array',
        ];
    }
}
