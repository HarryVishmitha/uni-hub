<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search')->trim();
        $branchId = $request->integer('branch_id');
        $roleFilter = (string) $request->string('role')->trim();

        $users = User::query()
            ->with(['roles:id,name', 'branch:id,name'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->when($roleFilter !== '', fn ($query) => $query->whereHas('roles', fn ($role) => $role->where('name', $roleFilter)))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'branch' => $user->branch?->name,
                'branch_id' => $user->branch_id,
                'roles' => $user->roles->pluck('name')->values(),
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ]);

        $roles = Role::query()->orderBy('name')->get(['id', 'name']);
        $branches = Branch::query()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Users/Index', [
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'role' => $roleFilter,
            ],
            'users' => $users,
            'roleOptions' => $roles->map(fn ($role) => ['id' => $role->id, 'name' => $role->name]),
            'branchOptions' => $branches->map(fn ($branch) => ['id' => $branch->id, 'name' => $branch->name]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'branch_id' => 'nullable|exists:branches,id',
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'branch_id' => $validated['branch_id'] ?? null,
        ]);

        if (! empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('alert', ['type' => 'success', 'message' => 'User account created.']);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'branch_id' => 'nullable|exists:branches,id',
            'roles' => 'array',
            'roles.*' => 'string|exists:roles,name',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'branch_id' => $validated['branch_id'] ?? null,
        ]);

        if (! empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()
            ->route('admin.users.index')
            ->with('alert', ['type' => 'success', 'message' => 'User account updated.']);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('alert', ['type' => 'success', 'message' => 'User removed.']);
    }
}
