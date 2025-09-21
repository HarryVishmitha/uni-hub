<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Room::class);
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
        $branchId = $this->input('branch_id');
        $building = $this->input('building');

        return [
            'branch_id' => ['required', Rule::exists('branches', 'id')],
            'building' => ['required', 'string', 'max:64'],
            'room_no' => [
                'required',
                'string',
                'max:32',
                Rule::unique('rooms')->where(fn ($query) => $query
                    ->where('branch_id', $branchId)
                    ->where('building', $building)
                ),
            ],
            'name' => ['nullable', 'string', 'max:255'],
            'seats' => ['required', 'integer', 'min:0', 'max:65535'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $branchId = $this->integer('branch_id');

            if ($user && ! BranchScope::allows($user, $branchId)) {
                $validator->errors()->add('branch_id', 'You cannot manage rooms for this branch.');
            }
        });
    }
}
