<?php

namespace App\Domain\Templates\Models;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Templates\Enums\TemplateVersionStatus;
use App\Domain\Themes\Models\ThemeVersion;
use Database\Factories\TemplateVersionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TemplateVersion extends Model
{
    /** @use HasFactory<TemplateVersionFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'template_id',
        'theme_version_id',
        'version_number',
        'status',
        'name',
        'preview_config',
        'default_config',
        'published_at',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function themeVersion(): BelongsTo
    {
        return $this->belongsTo(ThemeVersion::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(TemplatePage::class)->orderBy('sort_order');
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    protected static function newFactory(): TemplateVersionFactory
    {
        return TemplateVersionFactory::new();
    }

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'status' => TemplateVersionStatus::class,
            'preview_config' => 'array',
            'default_config' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
