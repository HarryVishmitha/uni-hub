<?php

namespace App\Support\Timetable;

use App\Models\SectionMeeting;
use App\Models\Term;
use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class TimetableService
{
    /**
     * Normalize meeting payload into consistent formats (arrays, time strings).
     */
    public function normalizeMeetingData(array $data): array
    {
        $normalized = $data;

        if (array_key_exists('day_of_week', $normalized)) {
            $normalized['day_of_week'] = (int) $normalized['day_of_week'];
        }

        if (array_key_exists('start_time', $normalized)) {
            $normalized['start_time'] = $this->normalizeTime($normalized['start_time']);
        }

        if (array_key_exists('end_time', $normalized)) {
            $normalized['end_time'] = $this->normalizeTime($normalized['end_time']);
        }

        if (array_key_exists('repeat_rule', $normalized)) {
            $normalized['repeat_rule'] = $this->normalizeRepeatRule($normalized['repeat_rule']);
        }

        if (! isset($normalized['modality'])) {
            $normalized['modality'] = 'onsite';
        }

        if (array_key_exists('room_id', $normalized) && $normalized['room_id'] !== null && $normalized['room_id'] !== '') {
            $normalized['room_id'] = (int) $normalized['room_id'];
        }

        return $normalized;
    }

    /**
     * Expand meeting occurrences across the term window, yielding weekly instances.
     */
    public function expandOccurrences(SectionMeeting|array $meeting, Term $term): Collection
    {
        $meetingData = $meeting instanceof SectionMeeting
            ? $this->normalizeMeetingData($meeting->toArray())
            : $this->normalizeMeetingData($meeting);

        $firstDate = $this->firstOccurrenceDate($meetingData, $term);
        $endDate = $this->recurrenceEndDate($meetingData, $term);
        $exDates = $this->exceptionDates($meetingData, $term);

        if (! $firstDate || ! $endDate || $endDate->lessThan($firstDate)) {
            return collect();
        }

        $occurrences = collect();
        $startTime = $meetingData['start_time'];
        $endTime = $meetingData['end_time'];

        for ($current = $firstDate; $current->lessThanOrEqualTo($endDate); $current = $current->addWeek()) {
            if ($exDates->contains(fn (CarbonImmutable $date) => $date->isSameDay($current))) {
                continue;
            }

            $occurrences->push([
                'meeting_id' => $meetingData['id'] ?? ($meeting instanceof SectionMeeting ? $meeting->id : null),
                'section_id' => $meetingData['section_id'] ?? ($meeting instanceof SectionMeeting ? $meeting->section_id : null),
                'start' => $current->setTimeFromTimeString($startTime),
                'end' => $current->setTimeFromTimeString($endTime),
                'room_id' => $meetingData['room_id'] ?? null,
                'day_of_week' => $meetingData['day_of_week'] ?? $current->dayOfWeek,
            ]);
        }

        return $occurrences;
    }

    public function firstOccurrenceDate(array $meetingData, Term $term): ?CarbonImmutable
    {
        $timezone = $this->resolveTimezone($term);
        $dayOfWeek = (int) ($meetingData['day_of_week'] ?? now()->dayOfWeek);
        $startDate = $term->start_date
            ? CarbonImmutable::parse($term->start_date, $timezone)->startOfDay()
            : CarbonImmutable::now($timezone)->startOfDay();

        $difference = ($dayOfWeek - $startDate->dayOfWeek + 7) % 7;

        return $startDate->addDays($difference);
    }

    public function recurrenceEndDate(array $meetingData, Term $term): ?CarbonImmutable
    {
        $timezone = $this->resolveTimezone($term);
        $termEnd = $term->end_date
            ? CarbonImmutable::parse($term->end_date, $timezone)->endOfDay()
            : CarbonImmutable::now($timezone)->addMonths(3)->endOfDay();

        $repeatRule = $meetingData['repeat_rule'] ?? [];

        if (is_array($repeatRule) && ! empty($repeatRule['until'])) {
            $until = CarbonImmutable::parse($repeatRule['until'], $timezone)->endOfDay();
            if ($until->lessThan($termEnd)) {
                return $until;
            }
        }

        return $termEnd;
    }

    public function exceptionDates(array $meetingData, Term $term): Collection
    {
        $timezone = $this->resolveTimezone($term);
        $repeatRule = $meetingData['repeat_rule'] ?? [];
        $exDates = collect(Arr::get($repeatRule, 'exdates', []));

        return $exDates
            ->map(fn ($date) => CarbonImmutable::parse($date, $timezone)->startOfDay())
            ->filter();
    }

    protected function normalizeTime(string $value): string
    {
        $value = trim($value);

        if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $value)) {
            return $value;
        }

        if (preg_match('/^\d{1,2}:\d{2}$/', $value)) {
            return CarbonImmutable::createFromFormat('H:i', $value)->format('H:i:s');
        }

        return CarbonImmutable::parse($value)->format('H:i:s');
    }

    protected function normalizeRepeatRule(mixed $rule): ?array
    {
        if ($rule === null || $rule === '') {
            return null;
        }

        if (is_string($rule)) {
            $decoded = json_decode($rule, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded ?: null;
            }

            return null;
        }

        if (is_array($rule)) {
            $freq = strtoupper((string) ($rule['freq'] ?? 'WEEKLY'));
            $normalized = [
                'freq' => $freq === '' ? 'WEEKLY' : $freq,
            ];

            if (! empty($rule['until'])) {
                $normalized['until'] = $rule['until'];
            }

            if (! empty($rule['exdates']) && is_array($rule['exdates'])) {
                $normalized['exdates'] = array_values(array_unique($rule['exdates']));
            }

            return $normalized;
        }

        return null;
    }

    protected function resolveTimezone(Term $term): string
    {
        return $term->branch?->timezone
            ?? config('app.timezone', 'UTC');
    }
}
