<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use App\Support\BranchScope;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Room $room */
        $room = $this->route('room');

        return $room && $this->user()->can('update', $room);
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
        /** @var Room $room */
        $room = $this->route('room');
        $roomId = $room?->id ?? 0;
        $branchId = $this->input('branch_id', $room?->branch_id);
        $building = $this->input('building', $room?->building);

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
                )->ignore($roomId),
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
