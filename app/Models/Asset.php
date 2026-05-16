<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'theme_id',
        'slug',
        'name',
        'type',
        'disk',
        'path',
        'thumbnail_path',
        'mime_type',
        'extension',
        'width',
        'height',
        'size_bytes',
        'metadata',
        'sort_order',
        'is_system',
        'is_active',
    ];

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    protected function casts(): array
    {
        return [
            'width' => 'integer',
            'height' => 'integer',
            'size_bytes' => 'integer',
            'metadata' => 'array',
            'sort_order' => 'integer',
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
