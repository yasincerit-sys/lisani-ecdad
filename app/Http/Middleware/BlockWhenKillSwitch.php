<?php

namespace App\Http\Middleware;

use App\Support\LisaniKillSwitch;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockWhenKillSwitch
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! LisaniKillSwitch::shouldBlock($request)) {
            return $next($request);
        }

        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'error' => 'maintenance',
                'message' => 'Lisanı Ecdad geçici olarak kapalıdır.',
            ], 503);
        }

        return response()->view('maintenance', [], 503);
    }
}
