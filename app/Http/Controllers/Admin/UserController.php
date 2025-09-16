<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->paginate(10);
        return Inertia::render('Admin/Users/Index', ['users' => $users]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'roles' => 'array',
            'appointments' => 'array',
            'appointments.*.ou_id' => 'required|exists:organizational_units,id',
            'appointments.*.role_id' => 'required|exists:roles,id',
            'appointments.*.scope_mode' => 'required|in:self,subtree,global',
            'appointments.*.is_primary' => 'boolean',
            'appointments.*.start_at' => 'nullable|date',
            'appointments.*.end_at' => 'nullable|date|after_or_equal:appointments.*.start_at',
        ]);

        DB::transaction(function () use ($validated) {
            $roles = $validated['roles'] ?? [];
            $appointments = $validated['appointments'] ?? [];

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
            ]);

            if (! empty($roles)) {
                $user->syncRoles($roles);
            }

            $this->replaceAppointments($user, $appointments);
        });

        return redirect()->route('admin.users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load('roles'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'array',
            'appointments' => 'array',
            'appointments.*.ou_id' => 'required|exists:organizational_units,id',
            'appointments.*.role_id' => 'required|exists:roles,id',
            'appointments.*.scope_mode' => 'required|in:self,subtree,global',
            'appointments.*.is_primary' => 'boolean',
            'appointments.*.start_at' => 'nullable|date',
            'appointments.*.end_at' => 'nullable|date|after_or_equal:appointments.*.start_at',
        ]);

        DB::transaction(function () use ($user, $validated) {
            $roles = $validated['roles'] ?? [];
            $appointments = $validated['appointments'] ?? [];

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            if (! empty($roles)) {
                $user->syncRoles($roles);
            }

            $this->replaceAppointments($user, $appointments);
        });

        return redirect()->route('admin.users.index');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('admin.users.index');
    }

    protected function replaceAppointments(User $user, array $appointments): void
    {
        if (empty($appointments)) {
            return;
        }

        $user->appointments()->delete();

        foreach ($appointments as $payload) {
            $user->appointments()->create([
                'ou_id' => $payload['ou_id'],
                'role_id' => $payload['role_id'],
                'scope_mode' => $payload['scope_mode'],
                'is_primary' => $payload['is_primary'] ?? false,
                'start_at' => $payload['start_at'] ?? null,
                'end_at' => $payload['end_at'] ?? null,
            ]);
        }
    }
}
