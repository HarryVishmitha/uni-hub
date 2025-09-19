<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // If the user is at the general dashboard, redirect to their role-specific dashboard
        if ($request->routeIs('dashboard')) {
            $dashboardRoute = $request->user()->preferredDashboardRoute();
            if ($dashboardRoute !== 'dashboard') {
                return redirect()->route($dashboardRoute);
            }
        }

        return $next($request);
    }
}
