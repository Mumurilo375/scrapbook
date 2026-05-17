<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    public function create(Request $request): Response
    {
        $returnTo = $this->safeRedirectTarget($request->query('return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('gift.create.return_to'))
            ?? $this->safeRedirectTarget($request->session()->get('url.intended'));

        if ($returnTo !== null) {
            $request->session()->put('url.intended', $returnTo);
        }

        return Inertia::render('auth/Register', [
            'homeUrl' => route('home'),
            'loginUrl' => route('login', $returnTo ? ['return_to' => $returnTo] : []),
            'returnTo' => $returnTo,
            'storeUrl' => route('register'),
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
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

        return redirect()->intended(route('app.gifts.index'));
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
