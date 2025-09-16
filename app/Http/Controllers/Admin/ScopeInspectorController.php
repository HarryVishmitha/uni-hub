<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Unite\OuAccessResolver;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScopeInspectorController extends Controller
{
    public function show(Request $request, User $user, OuAccessResolver $resolver)
    {
        abort_unless($request->user()?->can('manage-users'), 403);

        $scoped = $resolver->effectiveUnits($user);

        $appointments = $user->appointments()
            ->with(['organizationalUnit'])
            ->orderBy('start_at')
            ->get()
            ->map(fn ($appointment) => [
                'id' => $appointment->id,
                'role' => $appointment->role?->name,
                'scope_mode' => $appointment->scope_mode->value,
                'organizational_unit' => $appointment->organizationalUnit?->only([
                    'id', 'name', 'code', 'status', 'parent_id', 'path',
                ]),
                'start_at' => optional($appointment->start_at)?->toIso8601String(),
                'end_at' => optional($appointment->end_at)?->toIso8601String(),
            ]);

        return Inertia::render('Admin/ScopeInspector/Show', [
            'inspectedUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'scoped' => [
                'global' => (bool) $scoped->get('global', false),
                'unit_ids' => $scoped->get('unit_ids', collect())->values()->all(),
            ],
            'appointments' => $appointments,
        ]);
    }
}
