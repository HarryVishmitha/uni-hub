<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\SectionEnrollment;
use App\Models\Term;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $termFilter = $request->integer('term_id');
        $statusFilter = $request->string('status')->toString();

        $query = SectionEnrollment::query()
            ->with([
                'section.course.orgUnit',
                'section.term',
                'section.meetings.room',
                'section.appointments.user',
            ])
            ->where('student_id', $user->id)
            ->when($termFilter, fn ($builder) => $builder->whereHas('section', fn ($inner) => $inner->where('term_id', $termFilter)))
            ->when($statusFilter !== '', fn ($builder) => $builder->where('status', $statusFilter))
            ->orderByRaw(sprintf(
                "CASE status WHEN '%s' THEN 0 WHEN '%s' THEN 1 WHEN '%s' THEN 2 WHEN '%s' THEN 3 ELSE 4 END",
                SectionEnrollment::STATUS_ACTIVE,
                SectionEnrollment::STATUS_WAITLISTED,
                SectionEnrollment::STATUS_COMPLETED,
                SectionEnrollment::STATUS_FAILED
            ))
            ->orderByDesc('enrolled_at')
            ->get();

        $enrollments = $query->map(fn (SectionEnrollment $enrollment) => $this->transformEnrollment($enrollment))->values()->all();

        $terms = Term::query()
            ->whereHas('sections.enrollments', fn ($builder) => $builder->where('student_id', $user->id))
            ->orderByDesc('start_date')
            ->get(['id', 'title', 'code']);

        return Inertia::render('Account/Courses/Index', [
            'filters' => [
                'term_id' => $termFilter,
                'status' => $statusFilter,
            ],
            'enrollments' => $enrollments,
            'termOptions' => $terms,
            'statusOptions' => [
                SectionEnrollment::STATUS_ACTIVE,
                SectionEnrollment::STATUS_WAITLISTED,
                SectionEnrollment::STATUS_COMPLETED,
                SectionEnrollment::STATUS_FAILED,
            ],
        ]);
    }

    protected function transformEnrollment(SectionEnrollment $enrollment): array
    {
        $section = $enrollment->section;
        $course = $section?->course;
        $term = $section?->term;

        $meetings = $section?->meetings?->map(function ($meeting) {
            return [
                'id' => $meeting->id,
                'day_of_week' => $meeting->day_of_week,
                'day_name' => $this->dayName($meeting->day_of_week),
                'start_time' => $meeting->start_time?->format('H:i'),
                'end_time' => $meeting->end_time?->format('H:i'),
                'modality' => $meeting->modality,
                'room' => $meeting->room ? [
                    'id' => $meeting->room->id,
                    'label' => trim(implode(' ', array_filter([
                        $meeting->room->building,
                        $meeting->room->room_no,
                        $meeting->room->name ? '(' . $meeting->room->name . ')' : null,
                    ]))),
                ] : null,
            ];
        })->values()->all() ?? [];

        $lecturers = $section?->appointments?->filter(fn ($appointment) => $appointment->role === 'lecturer')->map(fn ($appointment) => [
            'id' => $appointment->user?->id,
            'name' => $appointment->user?->name,
            'email' => $appointment->user?->email,
        ])->values()->all() ?? [];

        return [
            'id' => $enrollment->id,
            'role' => $enrollment->role,
            'status' => $enrollment->status,
            'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
            'waitlisted_at' => $enrollment->waitlisted_at?->toIso8601String(),
            'dropped_at' => $enrollment->dropped_at?->toIso8601String(),
            'section' => $section ? [
                'id' => $section->id,
                'code' => $section->section_code,
                'notes' => $section->notes,
            ] : null,
            'course' => $course ? [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'credits' => $course->credit_hours,
                'org_unit' => $course->orgUnit ? [
                    'id' => $course->orgUnit->id,
                    'name' => $course->orgUnit->name,
                ] : null,
            ] : null,
            'term' => $term ? [
                'id' => $term->id,
                'title' => $term->title,
                'code' => $term->code,
                'start_date' => $term->start_date?->toDateString(),
                'end_date' => $term->end_date?->toDateString(),
            ] : null,
            'meetings' => $meetings,
            'lecturers' => $lecturers,
        ];
    }

    protected function dayName(int $day): string
    {
        return match ($day) {
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            default => 'Day',
        };
    }
}
