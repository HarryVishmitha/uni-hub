<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use App\Models\OrgUnit;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Course::class);
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if ($user && ! $user->isSuperAdmin()) {
            $this->merge([
                'branch_id' => $user->branch_id,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'org_unit_id' => ['required', Rule::exists('org_units', 'id')],
            'code' => ['required', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'credit_hours' => ['required', 'integer', 'min:0', 'max:10'],
            'delivery_mode' => ['required', Rule::in(Course::DELIVERY_MODES)],
            'status' => ['required', Rule::in(Course::STATUSES)],
            'outcomes' => ['sometimes', 'array'],
            'outcomes.*.outcome_code' => ['required_with:outcomes', 'string', 'max:32'],
            'outcomes.*.description' => ['required_with:outcomes', 'string'],
            'prerequisites' => ['sometimes', 'array'],
            'prerequisites.*.prereq_course_id' => ['required_with:prerequisites', 'integer', Rule::exists('courses', 'id')],
            'prerequisites.*.min_grade' => ['nullable', 'string', 'max:8'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $orgUnitId = $this->integer('org_unit_id');

            if (! $orgUnitId) {
                return;
            }

            $orgUnit = OrgUnit::query()->withTrashed()->find($orgUnitId);

            if (! $orgUnit) {
                return;
            }

            if ($user && ! BranchScope::allows($user, $orgUnit->branch_id)) {
                $validator->errors()->add('org_unit_id', 'You may only manage courses within your branch.');
            }

            $exists = Course::withTrashed()
                ->where('org_unit_id', $orgUnitId)
                ->whereRaw('LOWER(code) = ?', [strtolower((string) $this->input('code'))])
                ->exists();

            if ($exists) {
                $validator->errors()->add('code', 'This course code already exists for the selected organization unit.');
            }

            $outcomes = collect($this->input('outcomes', []));
            $normalizedCodes = $outcomes->pluck('outcome_code')->filter()->map(fn ($code) => strtoupper((string) $code));

            if ($normalizedCodes->duplicates()->isNotEmpty()) {
                $validator->errors()->add('outcomes', 'Outcome codes must be unique within the course.');
            }

            $outcomes->each(function ($outcome, $index) use ($validator, $orgUnit) {
                if (! isset($outcome['outcome_code']) || $outcome['outcome_code'] === '') {
                    $validator->errors()->add("outcomes.$index.outcome_code", 'Outcome code is required.');
                }

                if (! isset($outcome['description']) || $outcome['description'] === '') {
                    $validator->errors()->add("outcomes.$index.description", 'Outcome description is required.');
                }
            });

            $prereqs = collect($this->input('prerequisites', []));
            $prereqIds = $prereqs->pluck('prereq_course_id')->filter();

            if ($prereqIds->duplicates()->isNotEmpty()) {
                $validator->errors()->add('prerequisites', 'Duplicate prerequisites are not allowed.');
            }

            $prereqs->each(function ($prereq, $index) use ($validator, $orgUnit) {
                if (! isset($prereq['prereq_course_id'])) {
                    $validator->errors()->add("prerequisites.$index.prereq_course_id", 'Prerequisite course is required.');
                    return;
                }

                $course = Course::query()->find($prereq['prereq_course_id']);

                if (! $course) {
                    $validator->errors()->add("prerequisites.$index.prereq_course_id", 'Prerequisite course not found.');
                    return;
                }

                if ($course->branch_id !== $orgUnit->branch_id) {
                    $validator->errors()->add("prerequisites.$index.prereq_course_id", 'Prerequisite must be in the same branch.');
                }
            });
        });
    }
}
