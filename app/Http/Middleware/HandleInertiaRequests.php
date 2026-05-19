<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $sharedUser = $request->routeIs('public.gifts.*') ? null : $user;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $sharedUser ? [
                    'id' => $sharedUser->id,
                    'name' => $sharedUser->name,
                    'email' => $sharedUser->email,
                    'roles' => $sharedUser->getRoleNames()->values(),
                    'isAdmin' => $sharedUser->hasRole('admin'),
                ] : null,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'analytics' => [
                'eventUrl' => route('analytics.events', [], false),
                'enabled' => (bool) config('scrapbook.analytics.enabled', true),
            ],
        ];
    }
}
