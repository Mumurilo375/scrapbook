<?php

namespace App\Http\Controllers\Auth;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Models\AnalyticsSession;
use App\Domain\Analytics\Services\AnalyticsSessionResolver;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    public function create(Request $request, AnalyticsTracker $tracker): Response
    {
        $returnTo = $this->safeRedirectTarget($request->query('return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('gift.create.return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('url.intended'));

        if ($returnTo !== null) {
            $request->session()->put('url.intended', $returnTo);
        }

        $tracker->track(AnalyticsEventName::RegisterStarted, [
            'request' => $request,
            'source' => 'server',
        ]);

        return Inertia::render('auth/Register', [
            'homeUrl' => route('home'),
            'loginUrl' => route('login', $returnTo ? ['return_to' => $returnTo] : []),
            'returnTo' => $returnTo,
            'storeUrl' => route('register'),
        ]);
    }

    public function store(RegisterRequest $request, AnalyticsTracker $tracker): RedirectResponse
    {
        $data = $request->validated();

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole(Role::findOrCreate('customer', 'web'));

        Auth::login($user);
        $request->session()->regenerate();

        $this->rememberIntendedUrl($request, $data['return_to'] ?? null);
        $request->session()->forget('gift.create.return_to');
        $this->associateAnalyticsSession($request, $user);

        $tracker->track(AnalyticsEventName::UserRegistered, [
            'request' => $request,
            'source' => 'server',
            'user' => $user,
        ]);

        return redirect()->intended(route('app.gifts.index'));
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
