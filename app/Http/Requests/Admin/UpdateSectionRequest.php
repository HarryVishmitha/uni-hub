<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use App\Models\Section;
use App\Models\Term;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Section $section */
        $section = $this->route('section');

        return $section && $this->user()->can('update', $section);
    }

    protected function prepareForValidation(): void
    {
        if (! $this->filled('waitlist_cap')) {
            $this->merge(['waitlist_cap' => 0]);
        }
    }

    public function rules(): array
    {
        /** @var Section $section */
        $section = $this->route('section');
        $sectionId = $section?->id ?? 0;
        $courseId = $this->input('course_id', $section?->course_id);
        $termId = $this->input('term_id', $section?->term_id);

        return [
            'course_id' => ['required', Rule::exists('courses', 'id')],
            'term_id' => ['required', Rule::exists('terms', 'id')],
            'section_code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('sections')->where(fn ($query) => $query
                    ->where('course_id', $courseId)
                    ->where('term_id', $termId)
                )->ignore($sectionId),
            ],
            'capacity' => ['required', 'integer', 'min:0', 'max:65535'],
            'waitlist_cap' => ['nullable', 'integer', 'min:0', 'max:65535'],
            'status' => ['required', Rule::in(Section::STATUSES)],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Section $section */
            $section = $this->route('section');
            $user = $this->user();
            $courseId = $this->input('course_id', $section?->course_id);
            $termId = $this->input('term_id', $section?->term_id);

            $course = $courseId ? Course::with('orgUnit')->find($courseId) : null;
            $term = $termId ? Term::find($termId) : null;

            if (! $course) {
                $validator->errors()->add('course_id', 'Selected course was not found.');
            }

            if (! $term) {
                $validator->errors()->add('term_id', 'Selected term was not found.');
            }

            if ($course && $term) {
                $courseBranch = $course->branch_id;
                $termBranch = $term->branch_id;

                if ($courseBranch && $termBranch && $courseBranch !== $termBranch) {
                    $validator->errors()->add('term_id', 'Course and term must belong to the same branch.');
                }

                if ($user && ! $user->isSuperAdmin()) {
                    if ($courseBranch && ! BranchScope::allows($user, $courseBranch)) {
                        $validator->errors()->add('course_id', 'You cannot manage sections for this course.');
                    }

                    if ($termBranch && ! BranchScope::allows($user, $termBranch)) {
                        $validator->errors()->add('term_id', 'You cannot manage sections for this term.');
                    }
                }

                if (! in_array($term?->status, ['planned', 'active'], true)) {
                    $validator->errors()->add('term_id', 'Sections can only be updated for planned or active terms.');
                }
            }

            if ($this->integer('waitlist_cap') > $this->integer('capacity')) {
                $validator->errors()->add('waitlist_cap', 'Waitlist capacity cannot exceed primary capacity.');
            }
        });
    }
}
