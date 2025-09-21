<?php

namespace App\Http\Requests\Admin;

use App\Models\Room;
use App\Models\Section;
use App\Models\SectionMeeting;
use App\Support\BranchScope;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSectionMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Section $section */
        $section = $this->route('section');

        return $section && $this->user()->can('create', [SectionMeeting::class, $section]);
    }

    public function rules(): array
    {
        return [
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'room_id' => ['nullable', Rule::exists('rooms', 'id')],
            'modality' => ['required', Rule::in(['onsite', 'online', 'hybrid'])],
            'repeat_rule' => ['nullable', 'array'],
            'repeat_rule.freq' => ['sometimes', 'string', Rule::in(['WEEKLY'])],
            'repeat_rule.until' => ['nullable', 'date'],
            'repeat_rule.exdates' => ['nullable', 'array'],
            'repeat_rule.exdates.*' => ['date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            /** @var Section $section */
            $section = $this->route('section');
            $user = $this->user();
            $modality = $this->input('modality');
            $roomId = $this->input('room_id');
            $start = $this->input('start_time');
            $end = $this->input('end_time');

            if ($start && $end && $this->notAfter($start, $end)) {
                $validator->errors()->add('end_time', 'End time must be after start time.');
            }

            if ($modality === 'onsite' && ! $roomId) {
                $validator->errors()->add('room_id', 'Room is required for onsite meetings.');
            }

            if ($roomId) {
                $room = Room::find($roomId);
                $branch = $section?->branch_id;

                if (! $room) {
                    $validator->errors()->add('room_id', 'Selected room not found.');
                } elseif ($branch && $room->branch_id !== $branch) {
                    $validator->errors()->add('room_id', 'Meeting room must belong to the section branch.');
                } elseif (! $room->is_active) {
                    $validator->errors()->add('room_id', 'Room is not active.');
                }
            }

            if ($user && $section && ! BranchScope::allows($user, $section->branch_id)) {
                $validator->errors()->add('section_id', 'You cannot schedule meetings outside your branch.');
            }

            if ($section && ! in_array($section->term?->status, ['planned', 'active'], true)) {
                $validator->errors()->add('section_id', 'Meetings can only be added when the term is planned or active.');
            }

            if ($section && $this->filled('repeat_rule.until')) {
                $untilValue = $this->input('repeat_rule.until');
                $until = $untilValue ? CarbonImmutable::parse($untilValue) : null;
                $termStart = $section->term?->start_date ? CarbonImmutable::parse($section->term->start_date) : null;
                $termEnd = $section->term?->end_date ? CarbonImmutable::parse($section->term->end_date) : null;

                if ($termStart && $until && $until->lt($termStart)) {
                    $validator->errors()->add('repeat_rule.until', 'Repeat-until must be inside the term range.');
                }

                if ($termEnd && $until && $until->gt($termEnd)) {
                    $validator->errors()->add('repeat_rule.until', 'Repeat-until cannot exceed the term end date.');
                }
            }
        });
    }

    protected function notAfter(string $start, string $end): bool
    {
        $startTime = CarbonImmutable::createFromFormat('H:i', $start);
        $endTime = CarbonImmutable::createFromFormat('H:i', $end);

        return $startTime->greaterThanOrEqualTo($endTime);
    }
}
