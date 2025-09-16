<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $enrollments = Enrollment::with(['course', 'user'])->paginate(10);
        return Inertia::render('Enrollments/Index', ['enrollments' => $enrollments]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Enrollment::class);
        
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'user_id' => 'required|exists:users,id',
            'ou_id' => 'nullable|exists:organizational_units,id',
            'ou_context_id' => 'nullable|exists:organizational_units,id',
        ]);

        $course = Course::find($validated['course_id']);
        $ouId = $validated['ou_id'] ?? $course?->delivery_ou_id ?? $course?->owner_ou_id;

        Enrollment::create([
            ...$validated,
            'ou_id' => $ouId,
            'ou_context_id' => $validated['ou_context_id'] ?? $ouId,
        ]);

        return redirect()->route('enrollments.index');
    }

    public function destroy(Enrollment $enrollment)
    {
        $this->authorize('delete', $enrollment);
        
        $enrollment->delete();
        return redirect()->route('enrollments.index');
    }
}
