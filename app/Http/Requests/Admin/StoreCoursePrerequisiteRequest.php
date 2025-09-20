<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCoursePrerequisiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'prereq_course_id' => ['required', 'integer', Rule::exists('courses', 'id')],
            'min_grade' => ['nullable', 'string', 'max:8'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $course = $this->route('course');
            $prereqId = $this->integer('prereq_course_id');

            if (! $course || ! $prereqId) {
                return;
            }

            if ($course->id === $prereqId) {
                $validator->errors()->add('prereq_course_id', 'A course cannot be a prerequisite of itself.');
                return;
            }

            $prereq = Course::query()->find($prereqId);

            if (! $prereq) {
                return;
            }

            if ($prereq->branch_id !== $course->branch_id) {
                $validator->errors()->add('prereq_course_id', 'Prerequisites must come from the same branch.');
            }

            $exists = $course->prerequisites()
                ->wherePivot('prereq_course_id', $prereqId)
                ->exists();

            if ($exists) {
                $validator->errors()->add('prereq_course_id', 'This prerequisite is already attached to the course.');
            }
        });
    }
}
