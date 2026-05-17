<?php

namespace App\Domain\Gifts\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MusicSelection extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'provider',
        'provider_track_id',
        'title',
        'artist',
        'album',
        'artwork_url',
        'external_url',
        'preview_url',
        'metadata',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
