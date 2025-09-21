<?php

namespace App\Http\Requests\Admin\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Foundation\Http\FormRequest;

class DropRequest extends FormRequest
{
    public function authorize(): bool
    {
        $enrollment = $this->route('enrollment');

        if (! $enrollment instanceof SectionEnrollment) {
            return false;
        }

        return $this->user()?->can('delete', $enrollment) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'override' => $this->boolean('override'),
        ]);
    }

    public function rules(): array
    {
        return [
            'override' => ['sometimes', 'boolean'],
            'override_reason' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->boolean('override') && ! $this->filled('override_reason')) {
                $validator->errors()->add('override_reason', 'Please provide a reason when overriding drop restrictions.');
            }
        });
    }
}
