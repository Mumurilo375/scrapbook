<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\PreserveGiftCreationIntent;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function (Request $request): string {
            if ($request->isMethod('POST') && $request->routeIs('gifts.store')) {
                $returnTo = PreserveGiftCreationIntent::returnUrlFor($request);

                $request->session()->put('gift.create.return_to', $returnTo);
                $request->session()->put('url.intended', $returnTo);

                return route('login', ['return_to' => $returnTo]);
            }

            $returnTo = $request->session()->get('gift.create.return_to');

            return is_string($returnTo) && $returnTo !== ''
                ? route('login', ['return_to' => $returnTo])
                : route('login');
        });

        $middleware->redirectUsersTo(fn (Request $request): string => route('app.gifts.index'));

        $middleware->web(append: [
            PreserveGiftCreationIntent::class,
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
