<?php

namespace App\Http\Requests\Admin;

use App\Models\Term;
use App\Support\BranchScope;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTermRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('term'));
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        if ($user && ! $user->isSuperAdmin()) {
            $this->merge([
                'branch_id' => optional($this->route('term'))->branch_id,
            ]);
        }
    }

    public function rules(): array
    {
        $term = $this->route('term');

        return [
            'branch_id' => ['required', Rule::exists('branches', 'id')],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'add_drop_start' => ['nullable', 'date', 'after_or_equal:start_date'],
            'add_drop_end' => ['nullable', 'date', 'after_or_equal:add_drop_start', 'before_or_equal:end_date'],
            'status' => ['required', Rule::in(Term::STATUSES)],
            'description' => ['nullable', 'string'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $term = $this->route('term');
            $user = $this->user();
            $branchId = $this->integer('branch_id');

            if ($term && $user && ! BranchScope::allows($user, $term->branch_id)) {
                $validator->errors()->add('branch_id', 'You cannot update terms outside your branch.');
            }

            if ($user && ! BranchScope::allows($user, $branchId)) {
                $validator->errors()->add('branch_id', 'You are not allowed to manage terms for this branch.');
            }

            $start = $this->filled('start_date') ? CarbonImmutable::parse($this->input('start_date')) : null;
            $end = $this->filled('end_date') ? CarbonImmutable::parse($this->input('end_date')) : null;
            $addDropStart = $this->filled('add_drop_start') ? CarbonImmutable::parse($this->input('add_drop_start')) : null;
            $addDropEnd = $this->filled('add_drop_end') ? CarbonImmutable::parse($this->input('add_drop_end')) : null;

            if ($start && $end && $start->gte($end)) {
                $validator->errors()->add('start_date', 'The term must end after it starts.');
            }

            if ($addDropStart && ($addDropStart->lt($start) || $addDropStart->gt($end))) {
                $validator->errors()->add('add_drop_start', 'Add/drop must fall within the term dates.');
            }

            if ($addDropEnd && ($addDropEnd->lt($start) || $addDropEnd->gt($end))) {
                $validator->errors()->add('add_drop_end', 'Add/drop must fall within the term dates.');
            }
        });
    }
}
