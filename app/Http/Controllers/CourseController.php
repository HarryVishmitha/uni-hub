<?php

namespace App\Http\Controllers;

use App\Models\Course;
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
        ]);

        Course::create($validated);

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
        ]);

        $course->update($validated);

        return redirect()->route('courses.index');
    }

    public function destroy(Course $course)
    {
        $this->authorize('delete', $course);
        
        $course->delete();
        return redirect()->route('courses.index');
    }
}