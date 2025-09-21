<?php

namespace App\Http\Requests\Admin\Transcript;

use App\Models\Course;
use App\Models\Transcript;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTranscriptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Transcript::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:users,id'],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'term_id' => ['required', 'integer', 'exists:terms,id'],
            'final_grade' => ['nullable', 'string', 'max:12'],
            'grade_points' => ['nullable', 'numeric', 'min:0', 'max:4'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $student = User::find($this->input('student_id'));
            $course = Course::with('orgUnit.branch')->find($this->input('course_id'));
            $term = Term::find($this->input('term_id'));

            if (! $student || ! $course || ! $term) {
                return;
            }

            if (! $this->user()?->isSuperAdmin()) {
                if ($student->branch_id && $course->branch_id && (int) $student->branch_id !== (int) $course->branch_id) {
                    $validator->errors()->add('student_id', 'Student and course must belong to the same branch.');
                }

                if ($term->branch_id && $course->branch_id && (int) $term->branch_id !== (int) $course->branch_id) {
                    $validator->errors()->add('term_id', 'Term and course must belong to the same branch.');
                }
            }

            $exists = Transcript::query()
                ->where('student_id', $student->id)
                ->where('course_id', $course->id)
                ->where('term_id', $term->id)
                ->exists();

            if ($exists) {
                $validator->errors()->add('student_id', 'Transcript already exists for this student/course/term.');
            }
        });
    }
}
