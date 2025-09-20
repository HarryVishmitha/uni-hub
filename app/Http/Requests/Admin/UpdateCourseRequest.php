<?php

namespace App\Http\Requests\Admin;

use App\Models\Course;
use App\Models\OrgUnit;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('course'));
    }

    protected function prepareForValidation(): void
    {
        $course = $this->route('course');
        $user = $this->user();

        if ($course && $user && ! $user->isSuperAdmin()) {
            $this->merge([
                'org_unit_id' => $course->org_unit_id,
            ]);
        }
    }

    public function rules(): array
    {
        $course = $this->route('course');

        return [
            'org_unit_id' => ['required', Rule::exists('org_units', 'id')],
            'code' => ['required', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'credit_hours' => ['required', 'integer', 'min:0', 'max:10'],
            'delivery_mode' => ['required', Rule::in(Course::DELIVERY_MODES)],
            'status' => ['required', Rule::in(Course::STATUSES)],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $course = $this->route('course');
            $user = $this->user();
            $orgUnitId = $this->integer('org_unit_id');

            if (! $course || ! $orgUnitId) {
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
                ->where('id', '!=', $course->getKey())
                ->exists();

            if ($exists) {
                $validator->errors()->add('code', 'This course code already exists for the selected organization unit.');
            }
        });
    }
}
