<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Term;
use App\Models\User;
use App\Services\Admin\DashboardMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class DashboardApiController extends Controller
{
    public function __construct(private readonly DashboardMetricsService $metricsService)
    {
    }

    public function metrics(Request $request): JsonResponse
    {
        $branchId = $request->integer('branch_id');

        return response()->json(
            $this->metricsService->metrics($request->user(), $branchId)
        );
    }

    public function activities(Request $request): JsonResponse
    {
        $branchId = $this->resolveBranchId($request);

        $activities = Activity::query()
            ->whereIn('log_name', ['term', 'course', 'course_outcome', 'course_prerequisite'])
            ->latest()
            ->limit(50)
            ->with(['causer', 'subject'])
            ->get()
            ->filter(fn (Activity $activity) => $this->activityVisible($activity, $branchId))
            ->take(20)
            ->map(fn (Activity $activity) => [
                'id' => $activity->id,
                'title' => $this->activityTitle($activity),
                'description' => $activity->description,
                'timestamp' => optional($activity->created_at)->toIso8601String(),
                'icon' => $this->activityIcon($activity->log_name, $activity->event),
                'iconColor' => $this->activityIconColor($activity->log_name, $activity->event),
                'user' => $activity->causer?->only(['id', 'name', 'email']),
            ])
            ->values();

        return response()->json([
            'data' => $activities,
        ]);
    }

    public function quickActions(Request $request): JsonResponse
    {
        $branchId = $request->integer('branch_id');
        $metrics = $this->metricsService->metrics($request->user(), $branchId);

        return response()->json([
            'data' => $metrics['shortcuts'],
        ]);
    }

    protected function resolveBranchId(Request $request): ?int
    {
        $user = $request->user();
        $branchId = $request->integer('branch_id');

        if ($user->isSuperAdmin()) {
            return $branchId ?: null;
        }

        if ($branchId && (int) $branchId === (int) $user->branch_id) {
            return $branchId;
        }

        return $user->branch_id;
    }

    protected function activityVisible(Activity $activity, ?int $branchId): bool
    {
        if (! $branchId) {
            return true;
        }

        $subject = $activity->subject;

        if ($subject instanceof Term) {
            return (int) $subject->branch_id === (int) $branchId;
        }

        if ($subject instanceof Course) {
            return (int) $subject->branch_id === (int) $branchId;
        }

        if (method_exists($subject, 'course') && $subject->course) {
            return (int) $subject->course->branch_id === (int) $branchId;
        }

        return false;
    }

    protected function activityTitle(Activity $activity): string
    {
        $subject = $activity->subject;
        $label = match ($activity->log_name) {
            'term' => 'Term',
            'course' => 'Course',
            'course_outcome' => 'Course Outcome',
            'course_prerequisite' => 'Course Prerequisite',
            default => 'Record',
        };

        $name = $subject?->title
            ?? $subject?->code
            ?? $subject?->name
            ?? '#'.$activity->subject_id;
        $verb = match ($activity->event) {
            'created' => 'created',
            'updated' => 'updated',
            'deleted' => 'deleted',
            default => $activity->event,
        };

        return sprintf('%s %s (%s)', $label, $verb, $name);
    }

    protected function activityIcon(string $logName, ?string $event): string
    {
        return match ($logName) {
            'term' => 'lucide:calendar-clock',
            'course' => 'lucide:book-open',
            'course_outcome' => 'lucide:target',
            'course_prerequisite' => 'lucide:git-branch',
            default => 'lucide:activity',
        };
    }

    protected function activityIconColor(string $logName, ?string $event): string
    {
        return match ($logName) {
            'term' => 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
            'course' => 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
            'course_outcome' => 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
            'course_prerequisite' => 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
            default => 'text-gray-500 bg-gray-100 dark:bg-gray-800',
        };
    }
}
