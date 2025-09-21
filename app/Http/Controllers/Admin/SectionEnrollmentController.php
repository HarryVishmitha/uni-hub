<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Enrollment\BulkEnrollRequest;
use App\Http\Requests\Admin\Enrollment\DropRequest;
use App\Http\Requests\Admin\Enrollment\EnrollRequest;
use App\Http\Requests\Admin\Enrollment\UpdateSectionEnrollmentRequest;
use App\Models\Program;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use App\Services\Enrollment\EnrollmentService;
use App\Services\Enrollment\Exceptions\EnrollmentRuleException;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Arr;
use function Spatie\Activitylog\activity;

class SectionEnrollmentController extends Controller
{
    public function store(EnrollRequest $request, Section $section, EnrollmentService $service): JsonResponse
    {
        $this->authorize('view', $section);

        $data = $request->validated();
        $actor = $request->user();
        $student = User::findOrFail($data['student_id']);
        $section->loadMissing('term', 'course.prerequisites');

        try {
            $enrollment = $service->enroll(
                $actor,
                $student,
                $section,
                $data['role'],
                [
                    'override' => $data['override'] ?? false,
                    'override_reason' => $data['override_reason'] ?? null,
                    'bypass_prerequisites' => ($data['role'] === SectionEnrollment::ROLE_AUDITOR) || ($data['bypass_prerequisites'] ?? false),
                    'force_waitlist' => $data['force_waitlist'] ?? false,
                ]
            );
        } catch (EnrollmentRuleException $exception) {
            throw $this->toValidationException($exception);
        }

        $enrollment->loadMissing('student');

        return response()->json($this->transformEnrollment($enrollment), 201);
    }

    public function bulk(BulkEnrollRequest $request, Section $section, EnrollmentService $service): JsonResponse
    {
        $this->authorize('view', $section);

        $data = $request->validated();
        $actor = $request->user();

        $program = Program::findOrFail($data['program_id']);
        $term = Term::findOrFail($data['term_id']);
        $section->loadMissing('term', 'course.prerequisites');

        $options = [
            'override' => $data['override'] ?? false,
            'override_reason' => $data['override_reason'] ?? null,
            'force_waitlist' => $data['force_waitlist'] ?? false,
        ];

        $enrolled = 0;
        $waitlisted = 0;
        $failures = [];

        $studentIds = collect($data['student_ids'] ?? [])->unique()->values();

        foreach ($studentIds as $studentId) {
            $student = User::find($studentId);

            if (! $student) {
                $failures[] = [
                    'student_id' => $studentId,
                    'message' => 'Student not found.',
                ];
                continue;
            }

            try {
                $enrollment = $service->enroll($actor, $student, $section, SectionEnrollment::ROLE_STUDENT, $options);
                if ($enrollment->status === SectionEnrollment::STATUS_ACTIVE) {
                    $enrolled++;
                } elseif ($enrollment->status === SectionEnrollment::STATUS_WAITLISTED) {
                    $waitlisted++;
                }
            } catch (EnrollmentRuleException $exception) {
                $failures[] = [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'message' => $exception->getMessage(),
                    'context' => $exception->context,
                ];
            }
        }

        if ($cohort = $data['cohort'] ?? null) {
            $batchResult = $service->batchEnroll($actor, $program, $term, $section, ['cohort' => $cohort], $options);
            $enrolled += $batchResult['enrolled'];
            $waitlisted += $batchResult['waitlisted'];
            $failures = array_merge($failures, $batchResult['failures']);
        }

        return response()->json([
            'enrolled' => $enrolled,
            'waitlisted' => $waitlisted,
            'failures' => $failures,
        ]);
    }

    public function destroy(DropRequest $request, Section $section, SectionEnrollment $enrollment, EnrollmentService $service): JsonResponse
    {
        $this->authorize('view', $section);

        if ((int) $enrollment->section_id !== (int) $section->id) {
            abort(404);
        }

        try {
            $updated = $service->drop($request->user(), $enrollment, [
                'override' => $request->boolean('override'),
                'override_reason' => $request->input('override_reason'),
            ]);
        } catch (EnrollmentRuleException $exception) {
            throw $this->toValidationException($exception);
        }

        $updated->loadMissing('student');

        return response()->json($this->transformEnrollment($updated));
    }

    public function update(UpdateSectionEnrollmentRequest $request, Section $section, SectionEnrollment $enrollment): JsonResponse
    {
        $this->authorize('view', $section);

        if ((int) $enrollment->section_id !== (int) $section->id) {
            abort(404);
        }

        $data = $request->validated();
        $changes = Arr::only($data, ['role', 'status']);

        if (empty($changes)) {
            return response()->json($this->transformEnrollment($enrollment->fresh()));
        }

        $enrollment->fill($changes);
        $enrollment->save();

        if (function_exists('activity')) {
            \activity('enrollment')
                ->performedOn($enrollment)
                ->causedBy($request->user())
                ->event('enrollment.updated')
                ->withProperties([
                    'section_id' => $enrollment->section_id,
                    'student_id' => $enrollment->student_id,
                    'status' => $enrollment->status,
                    'role' => $enrollment->role,
                ])
                ->log('enrollment.updated');
        }

        return response()->json($this->transformEnrollment($enrollment->fresh()));
    }

    public function roster(Request $request, Section $section): JsonResponse
    {
        $this->authorize('view', $section);

        $perPage = (int) $request->integer('per_page', 50);
        $perPage = max(1, min($perPage, 100));

        $section->loadMissing('meetings', 'term');

        $query = $section->enrollments()->with([
            'student',
            'student.sectionEnrollments' => function ($builder) use ($section) {
                $builder
                    ->where('section_id', '!=', $section->id)
                    ->whereIn('status', [
                        SectionEnrollment::STATUS_ACTIVE,
                        SectionEnrollment::STATUS_WAITLISTED,
                    ])
                    ->whereHas('section', fn ($inner) => $inner->where('term_id', $section->term_id))
                    ->with(['section.course', 'section.meetings']);
            },
        ]);

        if ($status = $request->query('status')) {
            if ($status === 'waitlist') {
                $query->where('status', SectionEnrollment::STATUS_WAITLISTED);
            } else {
                $query->where('status', $status);
            }
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('student', function (Builder $builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $query->orderByRaw(sprintf(
            "CASE status WHEN '%s' THEN 0 WHEN '%s' THEN 1 WHEN '%s' THEN 2 WHEN '%s' THEN 3 ELSE 4 END",
            SectionEnrollment::STATUS_ACTIVE,
            SectionEnrollment::STATUS_WAITLISTED,
            SectionEnrollment::STATUS_COMPLETED,
            SectionEnrollment::STATUS_FAILED
        ))->orderBy('role')->orderBy('student_id');

        /** @var CursorPaginator $paginator */
        $paginator = $query->cursorPaginate($perPage)->withQueryString();

        $data = collect($paginator->items())
            ->map(fn (SectionEnrollment $enrollment) => $this->transformEnrollment($enrollment))
            ->values()
            ->all();

        return response()->json([
            'data' => $data,
            'next_cursor' => optional($paginator->nextCursor())->encode(),
            'prev_cursor' => optional($paginator->previousCursor())->encode(),
        ]);
    }

    protected function transformEnrollment(SectionEnrollment $enrollment): array
    {
        $enrollment->loadMissing('student');

        return [
            'id' => $enrollment->id,
            'student' => [
                'id' => $enrollment->student?->id,
                'name' => $enrollment->student?->name,
                'email' => $enrollment->student?->email,
                'branch_id' => $enrollment->student?->branch_id,
            ],
            'role' => $enrollment->role,
            'status' => $enrollment->status,
            'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
            'waitlisted_at' => $enrollment->waitlisted_at?->toIso8601String(),
            'dropped_at' => $enrollment->dropped_at?->toIso8601String(),
            'conflicts' => $this->detectConflicts($enrollment),
        ];
    }

    protected function toValidationException(EnrollmentRuleException $exception): ValidationException
    {
        $errors = ['enrollment' => [$exception->getMessage()]];

        if (! empty($exception->context)) {
            $errors['context'] = [$exception->context];
        }

        return ValidationException::withMessages($errors);
    }

    protected function detectConflicts(SectionEnrollment $enrollment): array
    {
        $section = $enrollment->section;
        $student = $enrollment->student;

        if (! $section || ! $student) {
            return [];
        }

        $student->loadMissing(['sectionEnrollments.section.course', 'sectionEnrollments.section.meetings']);

        $conflicts = [];

        foreach ($student->sectionEnrollments as $otherEnrollment) {
            if ($otherEnrollment->id === $enrollment->id) {
                continue;
            }

            if (! in_array($otherEnrollment->status, [SectionEnrollment::STATUS_ACTIVE, SectionEnrollment::STATUS_WAITLISTED], true)) {
                continue;
            }

            $otherSection = $otherEnrollment->section;

            if (! $otherSection || (int) $otherSection->term_id !== (int) $section->term_id) {
                continue;
            }

            foreach ($section->meetings as $meeting) {
                foreach ($otherSection->meetings as $otherMeeting) {
                    if ($meeting->day_of_week !== $otherMeeting->day_of_week) {
                        continue;
                    }

                    $startA = $meeting->start_time?->format('H:i:s');
                    $endA = $meeting->end_time?->format('H:i:s');
                    $startB = $otherMeeting->start_time?->format('H:i:s');
                    $endB = $otherMeeting->end_time?->format('H:i:s');

                    if (! $startA || ! $endA || ! $startB || ! $endB) {
                        continue;
                    }

                    if ($startA < $endB && $endA > $startB) {
                        $key = $otherSection->id.'-'.$otherMeeting->id;
                        $conflicts[$key] = [
                            'section_id' => $otherSection->id,
                            'course_code' => $otherSection->course?->code,
                            'course_title' => $otherSection->course?->title,
                            'section_code' => $otherSection->section_code,
                            'day_of_week' => $meeting->day_of_week,
                            'start_time' => $startB,
                            'end_time' => $endB,
                            'status' => $otherEnrollment->status,
                        ];
                    }
                }
            }
        }

        return array_values($conflicts);
    }
}
