<?php

namespace App\Services\Admin;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Term;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    public function metrics(User $user, ?int $branchId = null): array
    {
        $branchId = $this->resolveBranchId($user, $branchId);

        return [
            'scope' => [
                'branch_id' => $branchId,
                'is_global' => $branchId === null,
            ],
            'cards' => $this->buildCards($user, $branchId),
            'charts' => $this->buildCharts($branchId),
            'tableRows' => $this->buildTables($branchId),
            'shortcuts' => $this->buildShortcuts($user),
        ];
    }

    protected function resolveBranchId(User $user, ?int $requested): ?int
    {
        if ($user->isSuperAdmin()) {
            if ($requested && Branch::query()->whereKey($requested)->exists()) {
                return $requested;
            }

            return null;
        }

        if ($requested && BranchScope::allows($user, $requested)) {
            return $requested;
        }

        return $user->branch_id;
    }

    protected function buildCards(User $user, ?int $branchId): array
    {
        $branchQuery = Branch::query();

        if ($branchId) {
            $branchQuery->whereKey($branchId);
        }

        $branchCount = $branchQuery->count();

        $termQuery = Term::query()->when($branchId, fn ($q) => $q->where('branch_id', $branchId));
        $termsTotal = (clone $termQuery)->count();
        $activeTerms = (clone $termQuery)->where('status', 'active')->count();

        $courseQuery = Course::query()->whereHas('orgUnit', function ($query) use ($branchId) {
            if ($branchId) {
                $query->where('branch_id', $branchId);
            }
        });

        $coursesTotal = (clone $courseQuery)->count();
        $activeCourses = (clone $courseQuery)->where('status', 'active')->count();

        $userCounts = $this->userRoleCounts($branchId);
        $totalUsers = array_sum($userCounts);

        return [
            'overview' => [
                [
                    'key' => 'branches',
                    'title' => 'Branches',
                    'value' => $branchCount,
                    'change' => null,
                    'isPositive' => null,
                    'subtitle' => $branchId ? 'Scoped to branch' : 'Total branches',
                ],
                [
                    'key' => 'terms',
                    'title' => 'Terms',
                    'value' => $termsTotal,
                    'change' => null,
                    'isPositive' => null,
                    'subtitle' => $activeTerms.' active',
                ],
                [
                    'key' => 'courses',
                    'title' => 'Courses',
                    'value' => $coursesTotal,
                    'change' => null,
                    'isPositive' => null,
                    'subtitle' => $activeCourses.' active',
                ],
                [
                    'key' => 'users',
                    'title' => 'Users',
                    'value' => $totalUsers,
                    'change' => null,
                    'isPositive' => null,
                    'subtitle' => 'Scoped user roles',
                ],
            ],
            'users' => [
                'total' => $totalUsers,
                'byRole' => collect($userCounts)
                    ->map(fn ($count, $role) => [
                        'role' => $role,
                        'label' => $this->roleLabel($role),
                        'count' => $count,
                    ])->values()->all(),
            ],
        ];
    }

    protected function buildCharts(?int $branchId): array
    {
        $termStatusCounts = Term::query()
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->all();

        $courseModeCounts = Course::query()
            ->whereHas('orgUnit', function ($query) use ($branchId) {
                if ($branchId) {
                    $query->where('branch_id', $branchId);
                }
            })
            ->select('delivery_mode', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('delivery_mode')
            ->pluck('aggregate', 'delivery_mode')
            ->all();

        $courseStatusCounts = Course::query()
            ->whereHas('orgUnit', function ($query) use ($branchId) {
                if ($branchId) {
                    $query->where('branch_id', $branchId);
                }
            })
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->all();

        return [
            'termsByStatus' => [
                'labels' => array_keys($termStatusCounts),
                'dataset' => array_values($termStatusCounts),
            ],
            'coursesByMode' => [
                'labels' => array_keys($courseModeCounts),
                'dataset' => array_values($courseModeCounts),
            ],
            'coursesByStatus' => [
                'labels' => array_keys($courseStatusCounts),
                'dataset' => array_values($courseStatusCounts),
            ],
        ];
    }

    protected function buildTables(?int $branchId): array
    {
        $recentTerms = Term::query()
            ->with('branch:id,name,code')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderByDesc('start_date')
            ->limit(5)
            ->get()
            ->map(fn (Term $term) => [
                'id' => $term->id,
                'title' => $term->title,
                'status' => $term->status,
                'start_date' => $term->start_date?->toDateString(),
                'end_date' => $term->end_date?->toDateString(),
                'branch' => $term->branch?->only(['id', 'name', 'code']),
            ])->all();

        $recentCourses = Course::query()
            ->with(['orgUnit:id,name,code,branch_id', 'orgUnit.branch:id,name,code'])
            ->whereHas('orgUnit', function ($query) use ($branchId) {
                if ($branchId) {
                    $query->where('branch_id', $branchId);
                }
            })
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'status' => $course->status,
                'mode' => $course->delivery_mode,
                'org_unit' => $course->orgUnit?->only(['id', 'name', 'code']),
                'branch' => $course->orgUnit?->branch?->only(['id', 'name', 'code']),
                'updated_at' => optional($course->updated_at)->toDateTimeString(),
            ])->all();

        return [
            'recentTerms' => $recentTerms,
            'recentCourses' => $recentCourses,
        ];
    }

    protected function buildShortcuts(User $user): array
    {
        $items = [
            [
                'title' => 'Create Term',
                'description' => 'Plan upcoming academic terms.',
                'icon' => 'lucide:calendar-clock',
                'href' => route('admin.terms.create'),
                'permission' => 'term',
                'iconColor' => 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
            ],
            [
                'title' => 'Create Course',
                'description' => 'Define course offerings and availability.',
                'icon' => 'lucide:book-plus',
                'href' => route('admin.courses.create'),
                'permission' => 'course',
                'iconColor' => 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
            ],
            [
                'title' => 'Manage Org Units',
                'description' => 'Keep departments in sync.',
                'icon' => 'lucide:sitemap',
                'href' => route('admin.org-units.index'),
                'permission' => 'org_unit',
                'iconColor' => 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
            ],
        ];

        return collect($items)
            ->filter(function ($item) use ($user) {
                if ($item['permission'] === 'term') {
                    return $user->can('create', Term::class);
                }

                if ($item['permission'] === 'course') {
                    return $user->can('create', Course::class);
                }

                if ($item['permission'] === 'org_unit') {
                    return $user->can('viewAny', OrgUnit::class);
                }

                return true;
            })
            ->map(fn ($item) => Arr::except($item, ['permission']))
            ->values()
            ->all();
    }

    protected function userRoleCounts(?int $branchId): array
    {
        $query = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->join('users', 'users.id', '=', 'model_has_roles.model_id')
            ->where('model_type', User::class)
            ->when($branchId, fn ($q) => $q->where('users.branch_id', $branchId))
            ->select('roles.name as role', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('roles.name');

        return $query->pluck('aggregate', 'role')->toArray();
    }

    protected function roleLabel(string $role): string
    {
        return match ($role) {
            'super_admin' => 'Super Admins',
            'admin' => 'Admins',
            'branch_admin' => 'Branch Admins',
            'front_office' => 'Front Office',
            'lecturer' => 'Lecturers',
            'lab_manager' => 'Lab Managers',
            'student' => 'Students',
            default => ucfirst(str_replace('_', ' ', $role)),
        };
    }
}
