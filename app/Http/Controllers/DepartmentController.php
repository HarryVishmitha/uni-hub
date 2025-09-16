<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\OrganizationalUnit;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $departments = Department::paginate(10);
        return Inertia::render('Departments/Index', ['departments' => $departments]);
    }

    public function show(Department $department)
    {
        return Inertia::render('Departments/Show', [
            'department' => $department->load(['courses', 'school']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Department::class);
        return Inertia::render('Departments/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Department::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'school_id' => 'required|exists:schools,id',
            'ou_id' => 'nullable|exists:organizational_units,id',
            'parent_ou_id' => 'nullable|exists:organizational_units,id',
            'ou_context_id' => 'nullable|exists:organizational_units,id',
            'ou_code' => 'nullable|string|max:255',
            'ou_status' => 'nullable|string|max:50',
        ]);

        $unit = $this->resolveDepartmentUnit($request, $validated);

        Department::create([
            ...$validated,
            'ou_id' => $unit?->id,
            'ou_context_id' => $validated['ou_context_id'] ?? $unit?->id,
        ]);

        return redirect()->route('departments.index');
    }

    public function edit(Department $department)
    {
        $this->authorize('update', $department);
        return Inertia::render('Departments/Edit', ['department' => $department]);
    }

    public function update(Request $request, Department $department)
    {
        $this->authorize('update', $department);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'school_id' => 'required|exists:schools,id',
            'ou_id' => 'nullable|exists:organizational_units,id',
            'parent_ou_id' => 'nullable|exists:organizational_units,id',
            'ou_context_id' => 'nullable|exists:organizational_units,id',
            'ou_code' => 'nullable|string|max:255',
            'ou_status' => 'nullable|string|max:50',
        ]);

        $unit = $this->resolveDepartmentUnit($request, $validated, $department);

        $department->update([
            ...$validated,
            'ou_id' => $unit?->id,
            'ou_context_id' => $validated['ou_context_id'] ?? $unit?->id ?? $department->ou_context_id,
        ]);

        return redirect()->route('departments.index');
    }

    public function destroy(Department $department)
    {
        $this->authorize('delete', $department);
        
        $department->delete();
        return redirect()->route('departments.index');
    }

    protected function resolveDepartmentUnit(Request $request, array $validated, ?Department $department = null): ?OrganizationalUnit
    {
        if ($request->filled('ou_id')) {
            return OrganizationalUnit::find($validated['ou_id']);
        }

        if ($department?->organizationalUnit) {
            $unit = $department->organizationalUnit;

            $unit->fill(array_filter([
                'name' => $validated['name'] ?? null,
                'status' => $validated['ou_status'] ?? null,
            ]));

            if ($request->filled('parent_ou_id')) {
                $unit->parent_id = $validated['parent_ou_id'];
            }

            if ($request->filled('ou_code')) {
                $unit->code = $validated['ou_code'];
            }

            if ($unit->isDirty()) {
                $unit->save();
            }

            return $unit;
        }

        $code = $validated['ou_code'] ?? $this->generateUnitCode($validated['name']);

        return OrganizationalUnit::create([
            'type' => 'department',
            'name' => $validated['name'],
            'code' => $code,
            'parent_id' => $validated['parent_ou_id'] ?? null,
            'status' => $validated['ou_status'] ?? 'active',
            'metadata' => ['source' => 'department'],
        ]);
    }

    protected function generateUnitCode(string $name): string
    {
        $base = Str::upper(Str::slug($name, '_')) ?: 'OU';
        $code = $base;
        $suffix = 1;

        while (OrganizationalUnit::where('code', $code)->exists()) {
            $code = $base . '_' . $suffix++;
        }

        return $code;
    }
}
