<?php

namespace App\Providers;

use App\Contracts\Unite\OuAccessResolver as OuAccessResolverContract;
use App\Support\Unite\Config\ConfigResolver;
use App\Support\Unite\OuAccessResolver;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(OuAccessResolverContract::class, fn () => new OuAccessResolver());
        $this->app->singleton(ConfigResolver::class, fn () => new ConfigResolver());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Set up RBAC cache clearing
        \App\Support\Rbac\RbacCache::clearOnModelEvents();
    }
}
