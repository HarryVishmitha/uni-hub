<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAppointmentRequest;
use App\Http\Requests\Admin\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Section;
use App\Support\Flash;
use App\Support\Timetable\ConflictChecker;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function store(
        StoreAppointmentRequest $request,
        Section $section,
        ConflictChecker $conflictChecker
    ) {
        $section->loadMissing('term.branch', 'meetings');

        $data = $request->validated();

        $conflicts = $conflictChecker->checkAppointmentConflicts($section, $data);
        $this->ensureNoConflicts($conflicts);

        $appointment = $section->appointments()->create($data);
        $appointment->load('user');

        if ($request->expectsJson()) {
            return response()->json([
                'appointment' => $this->presentAppointment($appointment),
            ], 201);
        }

        Flash::success('Teaching assignment created successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function update(
        UpdateAppointmentRequest $request,
        Section $section,
        Appointment $appointment,
        ConflictChecker $conflictChecker
    ) {
        $this->authorize('update', $appointment);

        if ($appointment->section_id !== $section->id) {
            abort(404);
        }

        $section->loadMissing('term.branch', 'meetings');

        $data = $request->validated();

        $conflicts = $conflictChecker->checkAppointmentConflicts($section, $data, $appointment);
        $this->ensureNoConflicts($conflicts);

        $appointment->update($data);
        $appointment->load('user');

        if ($request->expectsJson()) {
            return response()->json([
                'appointment' => $this->presentAppointment($appointment),
            ]);
        }

        Flash::success('Teaching assignment updated successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function destroy(Request $request, Section $section, Appointment $appointment): RedirectResponse
    {
        $this->authorize('delete', $appointment);

        if ($appointment->section_id !== $section->id) {
            abort(404);
        }

        $appointment->delete();

        Flash::success('Teaching assignment removed successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    protected function ensureNoConflicts(array $conflicts): void
    {
        $messages = [];

        if (! empty($conflicts['teacher'])) {
            $messages['user_id'][] = 'Assigned staff have schedule conflicts.';
            $messages['conflict_matrix'] = [json_encode($conflicts)];
        }

        if ($messages) {
            throw ValidationException::withMessages($messages);
        }
    }

    protected function presentAppointment(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'user_id' => $appointment->user_id,
            'role' => $appointment->role,
            'load_percent' => $appointment->load_percent,
            'assigned_at' => optional($appointment->assigned_at)->toIso8601String(),
            'user' => $appointment->user?->only(['id', 'name', 'email', 'branch_id']),
        ];
    }
}
