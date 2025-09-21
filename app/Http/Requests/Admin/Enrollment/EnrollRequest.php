<?php

namespace App\Http\Requests\Admin\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnrollRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', SectionEnrollment::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'role' => $this->input('role', SectionEnrollment::ROLE_STUDENT),
            'override' => $this->boolean('override'),
            'force_waitlist' => $this->boolean('force_waitlist'),
            'bypass_prerequisites' => $this->boolean('bypass_prerequisites'),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:users,id'],
            'role' => ['required', Rule::in(SectionEnrollment::ROLES)],
            'override' => ['sometimes', 'boolean'],
            'override_reason' => ['nullable', 'string', 'max:255'],
            'force_waitlist' => ['sometimes', 'boolean'],
            'bypass_prerequisites' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('override') && ! $this->filled('override_reason')) {
                $validator->errors()->add('override_reason', 'Please provide a reason when overriding enrollment restrictions.');
            }
        });
    }
}
