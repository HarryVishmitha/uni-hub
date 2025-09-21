<?php

namespace App\Http\Requests\Admin;

use App\Models\Appointment;
use App\Models\Section;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Appointment $appointment */
        $appointment = $this->route('appointment');

        return $appointment && $this->user()->can('update', $appointment);
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', Rule::exists('users', 'id')],
            'role' => ['required', Rule::in(['lecturer', 'ta'])],
            'load_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'assigned_at' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Appointment $appointment */
            $appointment = $this->route('appointment');
            $section = $appointment?->section;
            $user = $this->user();
            $assigneeId = $this->input('user_id');
            $role = $this->input('role');
            $loadPercent = (int) $this->input('load_percent');

            $assignee = $assigneeId ? User::with('roles')->find($assigneeId) : null;

            if (! $assignee) {
                $validator->errors()->add('user_id', 'Selected user was not found.');
            }

            if ($section && $assignee) {
                $branchId = $section->branch_id;

                if ($branchId && ! BranchScope::allows($assignee, $branchId)) {
                    $validator->errors()->add('user_id', 'Assignee must belong to the section branch.');
                }

                if (! $this->roleAllowed($assignee, $role)) {
                    $validator->errors()->add('user_id', 'User does not have a compatible role for this assignment.');
                }

                if (! in_array($section->term?->status, ['planned', 'active'], true)) {
                    $validator->errors()->add('section_id', 'Appointments can only be updated when the term is planned or active.');
                }

                $duplicateExists = $section->appointments()
                    ->where('user_id', $assigneeId)
                    ->where('role', $role)
                    ->where('id', '!=', $appointment->id)
                    ->exists();

                if ($duplicateExists) {
                    $validator->errors()->add('user_id', 'This user already has the specified role on the section.');
                }

                $currentLoad = $section->appointments()->where('id', '!=', $appointment->id)->sum('load_percent');
                if ($currentLoad + $loadPercent > 100) {
                    $validator->errors()->add('load_percent', 'Teaching load cannot exceed 100% for a section.');
                }
            }

            if ($user && $section && ! BranchScope::allows($user, $section->branch_id)) {
                $validator->errors()->add('section_id', 'You cannot manage appointments outside your branch.');
            }
        });
    }

    protected function roleAllowed(User $assignee, ?string $role): bool
    {
        if (! $role) {
            return false;
        }

        return match ($role) {
            'lecturer' => $assignee->hasAnyRole(['lecturer', 'admin', 'branch_admin']),
            'ta' => $assignee->hasAnyRole(['lecturer', 'ta', 'admin', 'branch_admin']),
            default => false,
        };
    }
}
