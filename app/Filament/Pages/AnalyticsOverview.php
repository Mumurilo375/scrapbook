<?php

namespace App\Filament\Pages;

use App\Domain\Analytics\Services\AnalyticsMetrics;
use App\Filament\Support\AdminAccess;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class AnalyticsOverview extends Page
{
    protected static ?string $slug = 'analytics';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static string|UnitEnum|null $navigationGroup = 'Analytics';

    protected static ?string $navigationLabel = 'Analytics overview';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Analytics e observabilidade';

    protected string $view = 'filament.pages.analytics-overview';

    public static function canAccess(): bool
    {
        return AdminAccess::isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function dashboard(): array
    {
        return app(AnalyticsMetrics::class)->adminDashboard();
    }

    public function money(int $cents): string
    {
        return 'R$ '.number_format($cents / 100, 2, ',', '.');
    }
}
