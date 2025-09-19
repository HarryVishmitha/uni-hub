<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'roles' => $request->user()->roles->pluck('name')->values()->all(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->values()->all(),
                ] : null,
                'roles' => $request->user()?->roles()->pluck('name')->values()->all() ?? [],
                'permissions' => $request->user()?->getAllPermissions()->pluck('name')->values()->all() ?? [],
            ],
            'branch' => fn () => $this->branchPayload($request),
            'SITE' => [
                'name'        => config('app.name', 'LMS'),
                'baseUrl'     => config('app.url'), // e.g. https://lms.example.com
                'titleFormat' => ':title — :site',  // used if page passes a title
                'defaultTitle' => 'LMS — Learning that shapes the world',
                'description' => 'Official Learning Management System.',
                'keywords'    => ['LMS', 'University', 'Courses', 'Admissions'],
                'ogImage'     => asset('images/og/default-og.png'),
                'twitter'     => ['site' => '@your_handle'],
                'indexable'   => app()->environment('production'),
            ],
        ];
    }

    protected function branchPayload(Request $request): ?array
    {
        $branch = $request->attributes->get('activeBranch');

        if (! $branch) {
            return null;
        }

        return [
            'id' => $branch->id,
            'name' => $branch->name,
            'code' => $branch->code,
            'timezone' => $branch->timezone,
            'theme_tokens' => $branch->theme_tokens,
            'feature_flags' => $branch->feature_flags,
            'is_active' => $branch->is_active,
        ];
    }
}
