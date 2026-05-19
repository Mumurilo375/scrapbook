<?php

namespace App\Http\Middleware;

use App\Domain\Analytics\Services\AnalyticsSessionResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveAnalyticsSession
{
    public function __construct(private readonly AnalyticsSessionResolver $sessions) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->shouldSkip($request)) {
            $this->sessions->resolve($request);
        }

        return $next($request);
    }

    private function shouldSkip(Request $request): bool
    {
        return $request->is('admin*')
            || $request->is('up')
            || $request->is('analytics/events')
            || $request->routeIs('assets.preview')
            || $request->routeIs('public.gifts.media.*')
            || $request->routeIs('app.gifts.media.*');
    }
}
