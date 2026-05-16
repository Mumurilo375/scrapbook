<?php

namespace App\Models;

use App\Domain\Themes\Enums\ThemeVersionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ThemeVersion extends Model
{
    use HasUlids;

    protected $fillable = [
        'theme_id',
        'version',
        'status',
        'theme_tokens',
        'settings',
        'published_at',
        'archived_at',
    ];

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    public function templateVersions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class, 'default_theme_version_id');
    }

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'status' => ThemeVersionStatus::class,
            'theme_tokens' => 'array',
            'settings' => 'array',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }
}
