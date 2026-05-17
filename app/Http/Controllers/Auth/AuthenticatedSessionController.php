<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        $returnTo = $this->safeRedirectTarget($request->query('return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('gift.create.return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('url.intended'));

        if ($returnTo !== null) {
            $request->session()->put('url.intended', $returnTo);
        }

        return Inertia::render('auth/Login', [
            'createUrl' => route('create.index'),
            'homeUrl' => route('home'),
            'registerUrl' => route('register', $returnTo ? ['return_to' => $returnTo] : []),
            'returnTo' => $returnTo,
            'storeUrl' => route('login'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $this->rememberIntendedUrl($request, $request->validated('return_to'));
        $request->session()->forget('gift.create.return_to');

        return redirect()->intended(route('app.gifts.index'));
    }

    public function destroy(Request $request): RedirectResponse
    {
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
