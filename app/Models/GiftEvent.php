<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftEvent extends Model
{
    use HasUlids;

    protected $fillable = [
        'gift_id',
        'gift_visit_id',
        'gift_page_id',
        'event_type',
        'page_position',
        'payload_json',
        'occurred_at',
    ];

    public function gift(): BelongsTo
    {
        return $this->belongsTo(Gift::class);
    }

    public function giftVisit(): BelongsTo
    {
        return $this->belongsTo(GiftVisit::class);
    }

    public function giftPage(): BelongsTo
    {
        return $this->belongsTo(GiftPage::class);
    }

    protected function casts(): array
    {
        return [
            'page_position' => 'integer',
            'payload_json' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
