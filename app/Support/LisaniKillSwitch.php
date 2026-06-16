<?php

namespace App\Support;

use Illuminate\Http\Request;

class LisaniKillSwitch
{
    public static function isActive(): bool
    {
        if (filter_var(config('lisani.kill_switch'), FILTER_VALIDATE_BOOLEAN)) {
            return true;
        }

        return is_file(storage_path('app/LISANI_DOWN'));
    }

    /** Yerel geliştirme (XAMPP / artisan serve) kill switch'ten muaf. */
    public static function isLocalBypass(?Request $request = null): bool
    {
        if (! filter_var(config('lisani.kill_switch_allow_local', true), FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        if (app()->environment('local')) {
            return true;
        }

        $request ??= request();
        if (! $request) {
            return false;
        }

        $host = strtolower((string) $request->getHost());
        if (in_array($host, ['localhost', '127.0.0.1', '[::1]', '::1'], true)) {
            return true;
        }

        $ip = (string) $request->ip();

        return in_array($ip, ['127.0.0.1', '::1'], true);
    }

    public static function shouldBlock(?Request $request = null): bool
    {
        return self::isActive() && ! self::isLocalBypass($request);
    }
}
