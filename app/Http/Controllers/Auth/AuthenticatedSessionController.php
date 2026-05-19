<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Services\AnalyticsSessionResolver;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request, AnalyticsTracker $tracker): Response
    {
        $returnTo = $this->safeRedirectTarget($request->query('return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('gift.create.return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('url.intended'));

        if ($returnTo !== null) {
            $request->session()->put('url.intended', $returnTo);
        }

        $tracker->track(AnalyticsEventName::LoginViewed, [
            'request' => $request,
            'source' => 'server',
        ]);

        return Inertia::render('auth/Login', [
            'createUrl' => route('create.index'),
            'homeUrl' => route('home'),
            'registerUrl' => route('register', $returnTo ? ['return_to' => $returnTo] : []),
            'returnTo' => $returnTo,
            'storeUrl' => route('login'),
        ]);
    }

    public function store(LoginRequest $request, AnalyticsTracker $tracker): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $this->rememberIntendedUrl($request, $request->validated('return_to'));
        $request->session()->forget('gift.create.return_to');
        $user = auth()->user();

        if ($user instanceof User) {
            $this->associateAnalyticsSession($request, $user);
        }

        $tracker->track(AnalyticsEventName::UserLoggedIn, [
            'request' => $request,
            'source' => 'server',
            'user' => $user,
        ]);

        return redirect()->intended(route('app.gifts.index'));
    }

    public function destroy(Request $request, AnalyticsTracker $tracker): RedirectResponse
    {
        $user = $request->user();

        if ($user !== null) {
            $tracker->track(AnalyticsEventName::UserLoggedOut, [
                'request' => $request,
                'source' => 'server',
                'user' => $user,
            ]);
        }

        auth()->guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('status', 'Você saiu da sua conta.');
    }

    private function rememberIntendedUrl(Request $request, mixed $target): void
    {
        $returnTo = $this->safeRedirectTarget($target);

        if ($returnTo !== null) {
            $request->session()->put('url.intended', $returnTo);
        }
    }

    private function associateAnalyticsSession(Request $request, User $user): void
    {
        $sessionUuid = $request->cookies->get(AnalyticsSessionResolver::COOKIE_NAME);
        $sessionUuid = is_string($sessionUuid) && Str::isUuid($sessionUuid)
            ? $sessionUuid
            : $request->session()->get('analytics.session_uuid');

        if (! is_string($sessionUuid) || ! Str::isUuid($sessionUuid)) {
            return;
        }

        AnalyticsSession::query()
            ->where('session_uuid', $sessionUuid)
            ->update(['user_id' => $user->id]);
    }

    private function safeRedirectTarget(mixed $target): ?string
    {
        if (! is_string($target) || trim($target) === '') {
            return null;
        }

        $target = trim($target);

        if (str_starts_with($target, '//')) {
            return null;
        }

        $parts = parse_url($target);

        if ($parts === false) {
            return null;
        }

        if (isset($parts['host']) || isset($parts['scheme'])) {
            $app = parse_url(url('/'));

            if (($parts['host'] ?? null) !== ($app['host'] ?? null)) {
                return null;
            }
        } elseif (! str_starts_with($target, '/')) {
            return null;
        }

        $path = $parts['path'] ?? '/';

        if (in_array($path, ['/login', '/cadastro', '/logout'], true)) {
            return null;
        }

        $query = isset($parts['query']) ? '?'.$parts['query'] : '';

        return $path.$query;
    }
}
