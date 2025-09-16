<?php

namespace App\Http\Controllers;

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
        ]);

        Enrollment::create($validated);

        return redirect()->route('enrollments.index');
    }

    public function destroy(Enrollment $enrollment)
    {
        $this->authorize('delete', $enrollment);
        
        $enrollment->delete();
        return redirect()->route('enrollments.index');
    }
}