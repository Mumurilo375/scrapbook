<?php

namespace App\Providers;

use App\Domain\Gifts\Models\Gift;
use App\Domain\Gifts\Models\GiftPage;
use App\Domain\Media\Models\MediaItem;
use App\Domain\Templates\Models\Template;
use App\Domain\Themes\Models\Theme;
use App\Policies\GiftPagePolicy;
use App\Policies\GiftPolicy;
use App\Policies\MediaItemPolicy;
use App\Policies\TemplatePolicy;
use App\Policies\ThemePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Gift::class, GiftPolicy::class);
        Gate::policy(GiftPage::class, GiftPagePolicy::class);
        Gate::policy(MediaItem::class, MediaItemPolicy::class);
        Gate::policy(Template::class, TemplatePolicy::class);
        Gate::policy(Theme::class, ThemePolicy::class);

        RateLimiter::for('login', function (Request $request): Limit {
            $email = Str::lower((string) $request->input('email'));

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('register', fn (Request $request): Limit => Limit::perMinute(5)->by($request->ip()));
    }
}
