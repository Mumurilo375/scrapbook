<?php

namespace App\Domain\Assets\Models;

use App\Domain\Assets\Enums\AssetType;
use App\Domain\Themes\Models\ThemeVersion;
use Database\Factories\AssetFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Asset extends Model
{
    /** @use HasFactory<AssetFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'asset_category_id',
        'name',
        'slug',
        'type',
        'storage_disk',
        'storage_path',
        'public_url',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'metadata',
        'is_active',
        'sort_order',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function themeVersions(): BelongsToMany
    {
        return $this->belongsToMany(ThemeVersion::class, 'theme_asset')
            ->withPivot(['id', 'role', 'sort_order', 'config'])
            ->withTimestamps();
    }

    protected static function newFactory(): AssetFactory
    {
        return AssetFactory::new();
    }

    protected function casts(): array
    {
        return [
            'type' => AssetType::class,
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'metadata' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
