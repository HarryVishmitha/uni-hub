<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseOutcomeRequest;
use App\Http\Requests\Admin\UpdateCourseOutcomeRequest;
use App\Models\Course;
use App\Models\CourseOutcome;
use App\Support\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourseOutcomeController extends Controller
{
    public function store(StoreCourseOutcomeRequest $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $outcome = $course->outcomes()->create([
            'outcome_code' => strtoupper($request->input('outcome_code')),
            'description' => $request->input('description'),
        ]);

        Flash::success('Outcome added successfully.');

        return redirect()->route('admin.courses.show', $course);
    }

    public function update(UpdateCourseOutcomeRequest $request, Course $course, CourseOutcome $outcome): RedirectResponse
    {
        $this->authorize('update', $course);

        if ((int) $outcome->course_id !== (int) $course->id) {
            abort(404);
        }

        $outcome->update([
            'outcome_code' => strtoupper($request->input('outcome_code')),
            'description' => $request->input('description'),
        ]);

        Flash::success('Outcome updated successfully.');

        return redirect()->route('admin.courses.show', $course);
    }

    public function destroy(Request $request, Course $course, CourseOutcome $outcome): RedirectResponse
    {
        $this->authorize('update', $course);

        if ((int) $outcome->course_id !== (int) $course->id) {
            abort(404);
        }

        $outcome->delete();

        Flash::success('Outcome removed.');

        return redirect()->route('admin.courses.show', $course);
    }
}
