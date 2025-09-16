<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\OrganizationalUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourseController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $courses = Course::paginate(10);
        return Inertia::render('Courses/Index', ['courses' => $courses]);
    }

    public function show(Course $course)
    {
        return Inertia::render('Courses/Show', ['course' => $course]);
    }

    public function create()
    {
        $this->authorize('create', Course::class);
        return Inertia::render('Courses/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Course::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'owner_ou_id' => 'nullable|exists:organizational_units,id',
            'delivery_ou_id' => 'nullable|exists:organizational_units,id',
            'ou_context_id' => 'nullable|exists:organizational_units,id',
        ]);

        $ownerUnit = $this->resolveOwnerUnit($request, $validated);
        $deliveryUnit = $this->resolveDeliveryUnit($request, $validated, $ownerUnit);

        Course::create([
            ...$validated,
            'owner_ou_id' => $ownerUnit?->id,
            'delivery_ou_id' => $deliveryUnit?->id,
            'ou_context_id' => $validated['ou_context_id']
                ?? $deliveryUnit?->id
                ?? $ownerUnit?->id,
        ]);

        return redirect()->route('courses.index');
    }

    public function edit(Course $course)
    {
        $this->authorize('update', $course);
        return Inertia::render('Courses/Edit', ['course' => $course]);
    }

    public function update(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'owner_ou_id' => 'nullable|exists:organizational_units,id',
            'delivery_ou_id' => 'nullable|exists:organizational_units,id',
            'ou_context_id' => 'nullable|exists:organizational_units,id',
        ]);

        $ownerUnit = $this->resolveOwnerUnit($request, $validated, $course);
        $deliveryUnit = $this->resolveDeliveryUnit($request, $validated, $ownerUnit ?? $course->ownerUnit);

        $course->update([
            ...$validated,
            'owner_ou_id' => $ownerUnit?->id,
            'delivery_ou_id' => $deliveryUnit?->id,
            'ou_context_id' => $validated['ou_context_id']
                ?? $course->ou_context_id
                ?? $deliveryUnit?->id
                ?? $ownerUnit?->id,
        ]);

        return redirect()->route('courses.index');
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);
        
        $course->delete();
        return redirect()->route('courses.index');
    }

    protected function resolveOwnerUnit(Request $request, array $validated, ?Course $course = null): ?OrganizationalUnit
    {
        if ($request->filled('owner_ou_id')) {
            return OrganizationalUnit::find($validated['owner_ou_id']);
        }

        if ($course?->ownerUnit) {
            return $course->ownerUnit;
        }

        $department = Department::find($validated['department_id']);

        return $department?->organizationalUnit;
    }

    protected function resolveDeliveryUnit(Request $request, array $validated, ?OrganizationalUnit $fallback = null): ?OrganizationalUnit
    {
        if ($request->filled('delivery_ou_id')) {
            return OrganizationalUnit::find($validated['delivery_ou_id']);
        }

        return $fallback;
    }
}
