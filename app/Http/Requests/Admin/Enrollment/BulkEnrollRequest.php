<?php

namespace App\Http\Requests\Admin\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Foundation\Http\FormRequest;

class BulkEnrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', SectionEnrollment::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'override' => $this->boolean('override'),
            'force_waitlist' => $this->boolean('force_waitlist'),
        ]);
    }

    public function rules(): array
    {
        return [
            'program_id' => ['required', 'exists:programs,id'],
            'term_id' => ['required', 'exists:terms,id'],
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['integer', 'exists:users,id'],
            'cohort' => ['nullable', 'string', 'max:64'],
            'override' => ['sometimes', 'boolean'],
            'override_reason' => ['nullable', 'string', 'max:255'],
            'force_waitlist' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('override') && ! $this->filled('override_reason')) {
                $validator->errors()->add('override_reason', 'Please provide a reason when overriding enrollment restrictions.');
            }

            if (! $this->filled('cohort') && empty($this->input('student_ids', []))) {
                $validator->errors()->add('student_ids', 'Select at least one student or provide a cohort filter.');
            }
        });
    }
}
