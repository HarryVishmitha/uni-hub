<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCoursePrerequisiteRequest;
use App\Models\Course;
use App\Support\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CoursePrerequisiteController extends Controller
{
    public function store(StoreCoursePrerequisiteRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $course->prerequisites()->attach($request->integer('prereq_course_id'), [
            'min_grade' => $request->input('min_grade'),
        ]);

        Flash::success('Prerequisite added successfully.');

        return redirect()->route('admin.courses.show', $course);
    }

    public function destroy(Request $request, Course $course, Course $prerequisite): RedirectResponse
    {
        $this->authorize('update', $course);

        if (! $course->prerequisites()->where('courses.id', $prerequisite->id)->exists()) {
            abort(404);
        }

        $course->prerequisites()->detach($prerequisite->id);

        Flash::success('Prerequisite removed.');

        return redirect()->route('admin.courses.show', $course);
    }
}
