<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSectionMeetingRequest;
use App\Http\Requests\Admin\UpdateSectionMeetingRequest;
use App\Models\Section;
use App\Models\SectionMeeting;
use App\Support\Flash;
use App\Support\Timetable\ConflictChecker;
use App\Support\Timetable\TimetableService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SectionMeetingController extends Controller
{
    public function store(
        StoreSectionMeetingRequest $request,
        Section $section,
        TimetableService $timetable,
        ConflictChecker $conflictChecker
    ) {
        $section->loadMissing('term.branch', 'appointments.user');

        $data = $request->validated();
        $normalized = $timetable->normalizeMeetingData($data + ['section_id' => $section->id]);

        $conflicts = $conflictChecker->checkMeetingConflicts($section, $normalized);

        $this->ensureNoConflicts($conflicts);

        $meeting = $section->meetings()->create($normalized);
        $meeting->load('room');

        if ($request->expectsJson()) {
            return response()->json([
                'meeting' => $this->presentMeeting($meeting),
            ], 201);
        }

        Flash::success('Meeting scheduled successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function update(
        UpdateSectionMeetingRequest $request,
        Section $section,
        SectionMeeting $meeting,
        TimetableService $timetable,
        ConflictChecker $conflictChecker
    ) {
        $this->authorize('update', $meeting);

        if ($meeting->section_id !== $section->id) {
            abort(404);
        }

        $section->loadMissing('term.branch', 'appointments.user');

        $data = $request->validated();
        $normalized = $timetable->normalizeMeetingData($data + ['section_id' => $section->id, 'id' => $meeting->id]);

        $conflicts = $conflictChecker->checkMeetingConflicts($section, $normalized, $meeting);
        $this->ensureNoConflicts($conflicts);

        $meeting->update($normalized);
        $meeting->load('room');

        if ($request->expectsJson()) {
            return response()->json([
                'meeting' => $this->presentMeeting($meeting),
            ]);
        }

        Flash::success('Meeting updated successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function destroy(Request $request, Section $section, SectionMeeting $meeting): RedirectResponse
    {
        $this->authorize('delete', $meeting);

        if ($meeting->section_id !== $section->id) {
            abort(404);
        }

        $meeting->delete();

        Flash::success('Meeting removed successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    protected function ensureNoConflicts(array $conflicts): void
    {
        $messages = [];

        if (! empty($conflicts['room']['overlap_with'])) {
            $messages['room_id'][] = 'Room is already booked for the selected time.';
        }

        if (! empty($conflicts['teacher'])) {
            $messages['teacher'][] = 'Assigned teaching staff have schedule conflicts.';
        }

        if ($messages) {
            $messages['conflict_matrix'] = [json_encode($conflicts)];

            throw ValidationException::withMessages($messages);
        }
    }

    protected function presentMeeting(SectionMeeting $meeting): array
    {
        return [
            'id' => $meeting->id,
            'day_of_week' => $meeting->day_of_week,
            'start_time' => $meeting->start_time?->format('H:i'),
            'end_time' => $meeting->end_time?->format('H:i'),
            'room_id' => $meeting->room_id,
            'modality' => $meeting->modality,
            'repeat_rule' => $meeting->repeat_rule,
            'room' => $meeting->room?->only(['id', 'building', 'room_no', 'name', 'seats']),
        ];
    }
}
