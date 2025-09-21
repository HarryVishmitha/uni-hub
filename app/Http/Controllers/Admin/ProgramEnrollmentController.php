<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProgramEnrollment\StoreProgramEnrollmentRequest;
use App\Http\Requests\Admin\ProgramEnrollment\UpdateProgramEnrollmentRequest;
use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\Term;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class ProgramEnrollmentController extends Controller
{
    public function index(Request $request, Program $program): Response
    {
        $this->authorize('view', $program);

        $search = (string) $request->string('search')->trim();
        $cohortFilter = (string) $request->string('cohort')->trim();
        $statusFilter = (string) $request->string('status')->trim();

        $enrollments = ProgramEnrollment::query()
            ->with(['student:id,name,email,branch_id', 'startTerm:id,title,code,start_date,end_date,branch_id'])
            ->where('program_id', $program->id)
            ->when($cohortFilter !== '', fn ($query) => $query->where('cohort', $cohortFilter))
            ->when($statusFilter !== '', fn ($query) => $query->where('status', $statusFilter))
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('student', function ($builder) use ($search) {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('status')
            ->orderBy('cohort')
            ->orderBy('student_id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ProgramEnrollment $enrollment) => $this->transformProgramEnrollment($enrollment));

        /** @var LengthAwarePaginator $enrollments */

        $cohortOptions = ProgramEnrollment::query()
            ->where('program_id', $program->id)
            ->whereNotNull('cohort')
            ->distinct()
            ->pluck('cohort')
            ->filter()
            ->values();

        $statusCounts = ProgramEnrollment::query()
            ->where('program_id', $program->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $termOptions = Term::query()
            ->where('branch_id', $program->branch_id)
            ->orderBy('start_date')
            ->get(['id', 'title', 'code', 'start_date', 'end_date']);

        $availableStudents = User::query()
            ->role('student')
            ->where('branch_id', $program->branch_id)
            ->orderBy('name')
            ->limit(25)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
            ])
            ->values();

        return Inertia::render('Admin/Programs/Enrollments', [
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'branch_id' => $program->branch_id,
                'cohort_default' => $cohortOptions->first(),
            ],
            'filters' => [
                'search' => $search,
                'cohort' => $cohortFilter,
                'status' => $statusFilter,
            ],
            'enrollments' => $enrollments,
            'cohortOptions' => $cohortOptions->all(),
            'statusOptions' => ProgramEnrollment::STATUSES,
            'statusCounts' => $statusCounts->toArray(),
            'termOptions' => $termOptions,
            'studentOptions' => $availableStudents,
        ]);
    }

    public function store(StoreProgramEnrollmentRequest $request, Program $program): JsonResponse
    {
        $this->authorize('update', $program);

        $data = $request->validated();
        $actor = $request->user();

        $created = [];
        $restored = [];
        $skipped = [];

        foreach ($data['student_ids'] as $studentId) {
            $student = User::find($studentId);

            if (! $student) {
                $skipped[] = [
                    'student_id' => $studentId,
                    'message' => 'Student not found.',
                ];
                continue;
            }

            $enrollment = ProgramEnrollment::withTrashed()->firstOrNew([
                'student_id' => $student->id,
                'program_id' => $program->id,
            ]);

            $payload = [
                'status' => $data['status'] ?? ProgramEnrollment::STATUS_ACTIVE,
                'cohort' => $data['cohort'] ?? $enrollment->cohort,
                'start_term_id' => $data['start_term_id'] ?? $enrollment->start_term_id,
            ];

            $wasTrashed = false;

            if ($enrollment->exists) {
                if ($enrollment->trashed()) {
                    $enrollment->restore();
                    $wasTrashed = true;
                } else {
                    $enrollment->fill($payload)->save();
                    $skipped[] = [
                        'student_id' => $student->id,
                        'message' => 'Student is already enrolled in this program.',
                    ];
                    continue;
                }
            }

            $enrollment->fill($payload);
            $enrollment->save();

            $enrollment = $enrollment->fresh();

            if ($enrollment->wasRecentlyCreated) {
                $created[] = $this->transformProgramEnrollment($enrollment);
                continue;
            }

            if ($wasTrashed) {
                $restored[] = $this->transformProgramEnrollment($enrollment);
                continue;
            }

            $created[] = $this->transformProgramEnrollment($enrollment);
        }

        return response()->json([
            'created' => $created,
            'restored' => $restored,
            'skipped' => $skipped,
        ], 201);
    }

    public function update(UpdateProgramEnrollmentRequest $request, ProgramEnrollment $programEnrollment): JsonResponse
    {
        $data = $request->validated();

        $programEnrollment->fill(Arr::only($data, ['status', 'cohort', 'start_term_id']));
        $programEnrollment->save();

        return response()->json($this->transformProgramEnrollment($programEnrollment->fresh()));
    }

    public function destroy(Request $request, Program $program, ProgramEnrollment $programEnrollment): JsonResponse
    {
        $this->authorize('delete', $programEnrollment);

        if ((int) $programEnrollment->program_id !== (int) $program->id) {
            abort(404);
        }

        $programEnrollment->delete();

        return response()->json(['status' => 'deleted']);
    }

    protected function transformProgramEnrollment(ProgramEnrollment $enrollment): array
    {
        return [
            'id' => $enrollment->id,
            'student' => [
                'id' => $enrollment->student?->id,
                'name' => $enrollment->student?->name,
                'email' => $enrollment->student?->email,
            ],
            'status' => $enrollment->status,
            'cohort' => $enrollment->cohort,
            'start_term' => $enrollment->startTerm ? [
                'id' => $enrollment->startTerm->id,
                'title' => $enrollment->startTerm->title,
                'code' => $enrollment->startTerm->code,
            ] : null,
            'created_at' => $enrollment->created_at?->toIso8601String(),
            'updated_at' => $enrollment->updated_at?->toIso8601String(),
        ];
    }
}
