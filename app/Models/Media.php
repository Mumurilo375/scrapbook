<?php

namespace App\Models;

use App\Domain\Media\Enums\MediaStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'media';

    protected $fillable = [
        'user_id',
        'gift_id',
        'gift_page_id',
        'type',
        'status',
        'disk',
        'path',
        'original_path',
        'thumbnail_path',
        'mime_type',
        'extension',
        'width',
        'height',
        'size_bytes',
        'alt_text',
        'variants_json',
        'metadata',
        'processed_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function giftPage(): BelongsTo
    {
        return $this->belongsTo(GiftPage::class);
    }

    protected function casts(): array
    {
        return [
            'status' => MediaStatus::class,
            'width' => 'integer',
            'height' => 'integer',
            'size_bytes' => 'integer',
            'variants_json' => 'array',
            'metadata' => 'array',
            'processed_at' => 'datetime',
        ];
    }
}
