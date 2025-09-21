<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search')->trim();
        $logName = (string) $request->string('log_name')->trim();
        $event = (string) $request->string('event')->trim();
        $userId = $request->integer('user_id');

        $activities = Activity::query()
            ->with('causer:id,name')
            ->when($search !== '', fn ($query) => $query->where('description', 'like', "%{$search}%"))
            ->when($logName !== '', fn ($query) => $query->where('log_name', $logName))
            ->when($event !== '', fn ($query) => $query->where('event', $event))
            ->when($userId, fn ($query) => $query->where('causer_id', $userId))
            ->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (Activity $activity) => [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'event' => $activity->event,
                'description' => $activity->description,
                'created_at' => $activity->created_at?->toIso8601String(),
                'properties' => $activity->properties,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
            ]);

        $logNames = Activity::query()->distinct()->orderBy('log_name')->pluck('log_name')->filter()->values();
        $events = Activity::query()->distinct()->orderBy('event')->pluck('event')->filter()->values();
        $users = Activity::query()
            ->distinct('causer_id')
            ->whereNotNull('causer_id')
            ->with('causer:id,name')
            ->get()
            ->pluck('causer')
            ->filter()
            ->unique('id')
            ->map(fn ($user) => ['id' => $user->id, 'name' => $user->name])
            ->values();

        return Inertia::render('Admin/AuditLogs/Index', [
            'filters' => [
                'search' => $search,
                'log_name' => $logName,
                'event' => $event,
                'user_id' => $userId,
            ],
            'logs' => $activities,
            'logOptions' => $logNames,
            'eventOptions' => $events,
            'userOptions' => $users,
        ]);
    }
}
