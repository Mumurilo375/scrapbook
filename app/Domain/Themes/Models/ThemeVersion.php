<?php

namespace App\Domain\Themes\Models;

use App\Domain\Assets\Models\Asset;
use App\Domain\Gifts\Models\Gift;
use App\Domain\Templates\Models\TemplateVersion;
use App\Domain\Themes\Enums\ThemeVersionStatus;
use Database\Factories\ThemeVersionFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ThemeVersion extends Model
{
    /** @use HasFactory<ThemeVersionFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'theme_id',
        'version_number',
        'status',
        'name',
        'config',
        'published_at',
    ];

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function templateVersions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class);
    }

    public function gifts(): HasMany
    {
        return $this->hasMany(Gift::class);
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'theme_asset')
            ->withPivot(['id', 'role', 'sort_order', 'config'])
            ->withTimestamps();
    }

    protected static function newFactory(): ThemeVersionFactory
    {
        return ThemeVersionFactory::new();
    }

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'status' => ThemeVersionStatus::class,
            'config' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
