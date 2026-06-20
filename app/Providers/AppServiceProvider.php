<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('local') && ! $this->app->runningInConsole()) {
            $request = request();
            if ($request) {
                $root = rtrim($request->getSchemeAndHttpHost().$request->getBaseUrl(), '/');
                if ($root !== '') {
                    URL::forceRootUrl($root);
                }
            }
        }
    }
}
