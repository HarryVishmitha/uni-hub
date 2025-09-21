<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): Response
    {
        $search = (string) $request->string('search')->trim();

        $permissions = Permission::query()
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at?->toIso8601String(),
            ]);

        return Inertia::render('Admin/Permissions/Index', [
            'filters' => [
                'search' => $search,
            ],
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        Permission::create(['name' => $validated['name']]);

        return redirect()
            ->route('admin.permissions.index')
            ->with('alert', ['type' => 'success', 'message' => 'Permission created.']);
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        ]);

        $permission->update(['name' => $validated['name']]);

        return redirect()
            ->route('admin.permissions.index')
            ->with('alert', ['type' => 'success', 'message' => 'Permission updated.']);
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()
            ->route('admin.permissions.index')
            ->with('alert', ['type' => 'success', 'message' => 'Permission removed.']);
    }
}
