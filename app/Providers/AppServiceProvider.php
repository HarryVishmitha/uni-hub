<?php

namespace App\Providers;

use App\Models\Branch;
use App\Models\Curriculum;
use App\Models\OrgUnit;
use App\Models\Program;
use App\Models\University;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
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
        Vite::prefetch(concurrency: 3);

        // Set up RBAC cache clearing
        \App\Support\Rbac\RbacCache::clearOnModelEvents();

        Gate::policy(University::class, \App\Policies\UniversityPolicy::class);
        Gate::policy(Branch::class, \App\Policies\BranchPolicy::class);
        Gate::policy(OrgUnit::class, \App\Policies\OrgUnitPolicy::class);
        Gate::policy(Program::class, \App\Policies\ProgramPolicy::class);
        Gate::policy(Curriculum::class, \App\Policies\CurriculumPolicy::class);
    }
}
