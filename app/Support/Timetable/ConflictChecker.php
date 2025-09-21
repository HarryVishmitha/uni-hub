<?php

namespace App\Support\Timetable;

use App\Models\Appointment;
use App\Models\Section;
use App\Models\SectionMeeting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class ConflictChecker
{
    public function __construct(private readonly TimetableService $timetable)
    {
    }

    /**
     * Build a conflict matrix for a section, grouping room and teacher overlaps.
     */
    public function matrix(Section $section): array
    {
        $section->loadMissing(['term.branch', 'meetings.room', 'appointments.user']);

        $roomConflicts = [];
        foreach ($section->meetings as $meeting) {
            $conflict = $this->checkMeetingConflicts($section, $meeting->toArray(), $meeting);
            if (! empty($conflict['room']['overlap_with'])) {
                $roomConflicts[] = $conflict['room'];
            }
        }

        $teacherConflicts = [];
        foreach ($section->appointments as $appointment) {
            $result = $this->checkAppointmentConflicts($section, $appointment->toArray(), $appointment);
            foreach ($result['teacher'] as $row) {
                $key = $row['user_id'];
                if (! isset($teacherConflicts[$key])) {
                    $teacherConflicts[$key] = $row;
                } else {
                    $teacherConflicts[$key]['overlaps'] = array_values(array_unique(array_merge($teacherConflicts[$key]['overlaps'], $row['overlaps']), SORT_REGULAR));
                }
            }
        }

        return [
            'room' => array_values($roomConflicts),
            'teacher' => array_values($teacherConflicts),
        ];
    }

    /**
     * Check conflicts introduced by a given meeting payload.
     */
    public function checkMeetingConflicts(Section $section, array $meetingData, ?SectionMeeting $ignore = null): array
    {
        $meetingData = $this->timetable->normalizeMeetingData($meetingData);
        $term = $section->term; // expect eager loaded upstream

        $occurrences = $this->timetable->expandOccurrences($meetingData, $term);

        $roomConflicts = $this->detectRoomConflicts($section, $meetingData, $occurrences, $ignore);
        $teacherConflicts = $this->detectTeacherConflictsForMeeting($section, $occurrences, $ignore);

        return [
            'room' => [
                'meeting_id' => $meetingData['id'] ?? ($ignore?->id),
                'overlap_with' => $roomConflicts,
            ],
            'teacher' => $teacherConflicts,
        ];
    }

    /**
     * Check conflicts when assigning an instructor or TA.
     */
    public function checkAppointmentConflicts(Section $section, array $appointmentData, ?Appointment $ignore = null): array
    {
        $userId = (int) $appointmentData['user_id'];
        $section->loadMissing('meetings', 'term');
        $teacherConflicts = [];

        $sectionMeetings = $section->meetings;
        foreach ($sectionMeetings as $meeting) {
            $occurrences = $this->timetable->expandOccurrences($meeting->toArray(), $section->term);
            $conflicts = $this->detectTeacherConflictsUsingOccurrences($section, $occurrences, $userId, $meeting->id);

            if (! empty($conflicts)) {
                $teacherConflicts[$userId]['user_id'] = $userId;
                $teacherConflicts[$userId]['overlaps'] = array_values(array_unique(array_merge($teacherConflicts[$userId]['overlaps'] ?? [], $conflicts), SORT_REGULAR));
                $teacherConflicts[$userId]['role'] = $appointmentData['role'] ?? $ignore?->role;
            }
        }

        return [
            'teacher' => array_values($teacherConflicts),
        ];
    }

    protected function detectRoomConflicts(Section $section, array $meetingData, Collection $occurrences, ?SectionMeeting $ignore = null): array
    {
        if (empty($meetingData['room_id']) || $occurrences->isEmpty()) {
            return [];
        }

        $termId = $section->term_id;
        $branchId = $section->branch_id;

        $otherMeetings = SectionMeeting::query()
            ->where('room_id', $meetingData['room_id'])
            ->where('day_of_week', $meetingData['day_of_week'])
            ->whereHas('section', fn ($q) => $q->where('term_id', $termId))
            ->when($ignore, fn ($q) => $q->where('id', '!=', $ignore->id))
            ->when(isset($meetingData['id']), fn ($q) => $q->where('id', '!=', $meetingData['id']))
            ->when($branchId, fn ($q) => $q->whereHas('section.course.orgUnit', fn ($inner) => $inner->where('branch_id', $branchId)))
            ->with(['section:id,course_id,term_id', 'section.course:id,code,title', 'room:id,building,room_no,name'])
            ->get();

        $conflicts = [];
        foreach ($otherMeetings as $other) {
            if ($other->section_id === $section->id) {
                continue; // ignore same section for room conflicts
            }

            $otherOccurrences = $this->timetable->expandOccurrences($other->toArray(), $section->term);

            if ($this->hasOccurrenceOverlap($occurrences, $otherOccurrences)) {
                $conflicts[] = [
                    'section_id' => $other->section_id,
                    'meeting_id' => $other->id,
                    'course_code' => $other->section?->course?->code,
                    'room_id' => $other->room_id,
                    'day_of_week' => $other->day_of_week,
                    'start_time' => $other->start_time?->format('H:i'),
                    'end_time' => $other->end_time?->format('H:i'),
                ];
            }
        }

        return $conflicts;
    }

    protected function detectTeacherConflictsForMeeting(Section $section, Collection $occurrences, ?SectionMeeting $ignore = null): array
    {
        if ($occurrences->isEmpty()) {
            return [];
        }

        $section->loadMissing('appointments.user', 'term');
        $results = [];

        $appointments = $section->appointments;
        foreach ($appointments as $appointment) {
            $conflicts = $this->detectTeacherConflictsUsingOccurrences(
                $section,
                $occurrences,
                $appointment->user_id,
                $ignore?->id
            );

            if (! empty($conflicts)) {
                $results[] = [
                    'user_id' => $appointment->user_id,
                    'user_name' => $appointment->user?->name,
                    'role' => $appointment->role,
                    'overlaps' => $conflicts,
                ];
            }
        }

        return $results;
    }

    protected function detectTeacherConflictsUsingOccurrences(Section $section, Collection $occurrences, int $userId, ?int $ignoreMeetingId = null): array
    {
        if ($occurrences->isEmpty()) {
            return [];
        }

        $termId = $section->term_id;
        $branchId = $section->branch_id;
        $dayOfWeek = $occurrences->first()['day_of_week'] ?? null;

        $otherMeetings = SectionMeeting::query()
            ->select('section_meetings.*')
            ->distinct()
            ->whereHas('section', fn ($q) => $q->where('term_id', $termId))
            ->whereHas('section.appointments', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->where('section_id', '!=', $section->id)
            ->when($ignoreMeetingId, fn ($q) => $q->where('id', '!=', $ignoreMeetingId))
            ->when($dayOfWeek !== null, fn ($q) => $q->where('day_of_week', $dayOfWeek))
            ->when($branchId, fn ($q) => $q->whereHas('section.course.orgUnit', fn ($inner) => $inner->where('branch_id', $branchId)))
            ->with(['section:id,course_id,term_id', 'section.course:id,code,title', 'section.appointments' => fn ($query) => $query->where('user_id', $userId)])
            ->get();

        $conflicts = [];
        foreach ($otherMeetings as $other) {
            $otherOccurrences = $this->timetable->expandOccurrences($other->toArray(), $section->term);

            if ($this->hasOccurrenceOverlap($occurrences, $otherOccurrences)) {
                $conflicts[] = [
                    'section_id' => $other->section_id,
                    'meeting_id' => $other->id,
                    'course_code' => $other->section?->course?->code,
                    'day_of_week' => $other->day_of_week,
                    'start_time' => $other->start_time?->format('H:i'),
                    'end_time' => $other->end_time?->format('H:i'),
                ];
            }
        }

        return $conflicts;
    }

    protected function hasOccurrenceOverlap(Collection $first, Collection $second): bool
    {
        foreach ($first as $a) {
            foreach ($second as $b) {
                if ($a['start']->isSameDay($b['start']) && $this->timesOverlap($a['start'], $a['end'], $b['start'], $b['end'])) {
                    return true;
                }
            }
        }

        return false;
    }

    protected function timesOverlap(CarbonImmutable $startA, CarbonImmutable $endA, CarbonImmutable $startB, CarbonImmutable $endB): bool
    {
        return $startA->lt($endB) && $startB->lt($endA);
    }
}
