<?php

namespace App\Http\Requests\Admin\ProgramEnrollment;

use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProgramEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ProgramEnrollment::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'student_ids' => collect($this->input('student_ids', []))->filter()->unique()->values()->all(),
            'status' => $this->input('status', ProgramEnrollment::STATUS_ACTIVE),
        ]);
    }

    public function rules(): array
    {
        return [
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:users,id'],
            'cohort' => ['nullable', 'string', 'max:120'],
            'start_term_id' => ['nullable', 'integer', 'exists:terms,id'],
            'status' => ['required', Rule::in(ProgramEnrollment::STATUSES)],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Program|null $program */
            $program = $this->route('program');
            if (! $program instanceof Program) {
                $validator->errors()->add('program_id', 'Invalid program context.');
                return;
            }

            $startTermId = $this->input('start_term_id');
            if ($startTermId) {
                $term = Term::find($startTermId);
                if (! $term) {
                    $validator->errors()->add('start_term_id', 'Selected start term was not found.');
                } elseif (! $this->user()?->isSuperAdmin() && $term->branch_id !== $program->branch_id) {
                    $validator->errors()->add('start_term_id', 'Start term must belong to the same branch as the program.');
                }
            }

            $studentIds = $this->input('student_ids', []);
            if (empty($studentIds)) {
                return;
            }

            $students = User::query()->whereIn('id', $studentIds)->get(['id', 'branch_id']);

            $invalid = $students->filter(function (User $student) use ($program) {
                if ($this->user()?->isSuperAdmin()) {
                    return false;
                }

                if ($student->branch_id === null) {
                    return true;
                }

                return (int) $student->branch_id !== (int) $program->branch_id;
            });

            if ($invalid->isNotEmpty()) {
                $validator->errors()->add('student_ids', 'All students must belong to the same branch as the program.');
            }
        });
    }
}
