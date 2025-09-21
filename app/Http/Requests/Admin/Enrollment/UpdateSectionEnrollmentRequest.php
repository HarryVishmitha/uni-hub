<?php

namespace App\Http\Requests\Admin\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSectionEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $enrollment = $this->route('enrollment');

        if (! $enrollment instanceof SectionEnrollment) {
            return false;
        }

        return $this->user()?->can('update', $enrollment) ?? false;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', Rule::in(SectionEnrollment::ROLES)],
            'status' => ['sometimes', Rule::in([
                SectionEnrollment::STATUS_COMPLETED,
                SectionEnrollment::STATUS_FAILED,
            ])],
        ];
    }
}
