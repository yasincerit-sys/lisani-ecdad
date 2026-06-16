<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        if (filter_var(env('LISANI_KILL_SWITCH', false), FILTER_VALIDATE_BOOLEAN)) {
            $middleware->prepend(\App\Http\Middleware\BlockWhenKillSwitch::class);
        }
        $middleware->alias([
            'not.banned' => \App\Http\Middleware\EnsureNotBanned::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
