<?php

namespace App\Http\Requests\Admin\ProgramEnrollment;

use App\Models\ProgramEnrollment;
use App\Models\Term;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgramEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $enrollment = $this->route('program_enrollment');

        if (! $enrollment instanceof ProgramEnrollment) {
            return false;
        }

        return $this->user()?->can('update', $enrollment) ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(ProgramEnrollment::STATUSES)],
            'cohort' => ['nullable', 'string', 'max:120'],
            'start_term_id' => ['nullable', 'integer', 'exists:terms,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var ProgramEnrollment|null $enrollment */
            $enrollment = $this->route('program_enrollment');
            if (! $enrollment instanceof ProgramEnrollment) {
                return;
            }

            $startTermId = $this->input('start_term_id');
            if ($startTermId) {
                $term = Term::find($startTermId);
                if (! $term) {
                    $validator->errors()->add('start_term_id', 'Selected start term was not found.');
                } elseif (! $this->user()?->isSuperAdmin() && $term->branch_id !== $enrollment->branch_id) {
                    $validator->errors()->add('start_term_id', 'Start term must belong to the same branch as the enrollment.');
                }
            }
        });
    }
}
