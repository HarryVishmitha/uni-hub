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
                'user' => $request->user(),
            ],
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
}
