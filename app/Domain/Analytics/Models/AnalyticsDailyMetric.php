<?php

namespace App\Domain\Analytics\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsDailyMetric extends Model
{
    protected $fillable = [
        'date',
        'metric_key',
        'dimensions',
        'value_numeric',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'dimensions' => 'array',
            'value_numeric' => 'decimal:2',
            'metadata' => 'array',
        ];
    }
}
