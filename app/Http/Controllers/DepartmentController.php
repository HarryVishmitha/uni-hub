<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        ]);

        Department::create($validated);

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
        ]);

        $department->update($validated);

        return redirect()->route('departments.index');
    }

    public function destroy(Department $department)
    {
        $this->authorize('delete', $department);
        
        $department->delete();
        return redirect()->route('departments.index');
    }
}