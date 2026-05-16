<?php

namespace App\Models;

use App\Domain\Templates\Enums\TemplateVersionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplateVersion extends Model
{
    use HasUlids;

    protected $fillable = [
        'template_id',
        'default_theme_version_id',
        'version',
        'status',
        'content_json',
        'settings',
        'published_at',
        'archived_at',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function defaultThemeVersion(): BelongsTo
    {
        return $this->belongsTo(ThemeVersion::class, 'default_theme_version_id');
    }

    public function pages(): HasMany
    {
        return $this->hasMany(TemplatePage::class)->orderBy('position');
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'status' => TemplateVersionStatus::class,
            'content_json' => 'array',
            'settings' => 'array',
            'published_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }
}
