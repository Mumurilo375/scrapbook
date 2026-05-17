<?php

namespace App\Domain\Media\Models;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Media\Enums\MediaStatus;
use App\Domain\Media\Enums\MediaType;
use App\Models\User;
use Database\Factories\MediaItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaItem extends Model
{
    /** @use HasFactory<MediaItemFactory> */
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'gift_id',
        'type',
        'original_filename',
        'storage_disk',
        'storage_path',
        'mime_type',
        'size_bytes',
        'width',
        'height',
        'variants',
        'metadata',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    protected static function newFactory(): MediaItemFactory
    {
        return MediaItemFactory::new();
    }

    protected function casts(): array
    {
        return [
            'type' => MediaType::class,
            'status' => MediaStatus::class,
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'variants' => 'array',
            'metadata' => 'array',
        ];
    }
}
