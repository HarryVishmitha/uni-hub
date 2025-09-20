<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use App\Models\CourseOutcome;
use Illuminate\Foundation\Http\FormRequest;

class StoreCourseOutcomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    public function rules(): array
    {
        return [
            'outcome_code' => ['required', 'string', 'max:32'],
            'description' => ['required', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $course = $this->route('course');

            if (! $course) {
                return;
            }

            $exists = CourseOutcome::query()
                ->where('course_id', $course->id)
                ->whereRaw('LOWER(outcome_code) = ?', [strtolower((string) $this->input('outcome_code'))])
                ->exists();

            if ($exists) {
                $validator->errors()->add('outcome_code', 'Outcome codes must be unique per course.');
            }
        });
    }
}
