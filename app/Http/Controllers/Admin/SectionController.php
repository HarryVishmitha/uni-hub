<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreSectionRequest;
use App\Http\Requests\Admin\UpdateSectionRequest;
use App\Models\Branch;
use App\Models\Course;
use App\Models\Room;
use App\Models\Section;
use App\Models\Term;
use App\Models\User;
use App\Support\BranchScope;
use App\Support\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Section::class);

        $user = $request->user();
        $branchId = $request->integer('branch_id') ?: ($user->isSuperAdmin() ? null : $user->branch_id);

        if ($branchId && ! BranchScope::allows($user, $branchId)) {
            abort(403, 'You cannot view sections for this branch.');
        }

        $search = trim((string) $request->string('search'));
        $termId = $request->integer('term_id');
        $courseId = $request->integer('course_id');
        $status = $request->string('status')->toString();

        $sectionsQuery = Section::query()
            ->with([
                'course:id,org_unit_id,code,title',
                'course.orgUnit:id,name,branch_id',
                'term:id,branch_id,title,code,status,start_date,end_date',
            ])
            ->withCount(['meetings', 'appointments'])
            ->when($branchId, fn ($q) => $q->whereHas('course.orgUnit', fn ($sub) => $sub->where('branch_id', $branchId)))
            ->when($termId, fn ($q) => $q->where('term_id', $termId))
            ->when($courseId, fn ($q) => $q->where('course_id', $courseId))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('section_code', 'like', "%{$search}%")
                        ->orWhereHas('course', fn ($courseQuery) => $courseQuery->where('code', 'like', "%{$search}%")->orWhere('title', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('updated_at');

        $sections = $sectionsQuery
            ->paginate(20)
            ->withQueryString()
            ->through(function (Section $section) {
                $course = $section->course;
                $term = $section->term;

                return [
                    'id' => $section->id,
                    'section_code' => $section->section_code,
                    'status' => $section->status,
                    'status_label' => ucfirst($section->status),
                    'capacity' => $section->capacity,
                    'waitlist_cap' => $section->waitlist_cap,
                    'branch_id' => $section->branch_id,
                    'course' => $course?->only(['id', 'code', 'title']) + [
                        'org_unit' => $course?->orgUnit?->only(['id', 'name', 'branch_id']) ?? null,
                    ],
                    'term' => $term ? [
                        'id' => $term->id,
                        'title' => $term->title,
                        'code' => $term->code,
                        'status' => $term->status,
                        'start_date' => optional($term->start_date)->format('Y-m-d'),
                        'end_date' => optional($term->end_date)->format('Y-m-d'),
                    ] : null,
                    'meetings_count' => $section->meetings_count,
                    'appointments_count' => $section->appointments_count,
                    'updated_at' => optional($section->updated_at)->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Sections/Index', [
            'filters' => [
                'branch_id' => $branchId,
                'search' => $search,
                'term_id' => $termId,
                'course_id' => $courseId,
                'status' => $status,
            ],
            'sections' => $sections,
            'statusOptions' => Section::STATUSES,
            'termOptions' => $this->termOptions($user, $branchId),
            'courseOptions' => $this->courseOptions($user, $branchId),
            'branchOptions' => $user->isSuperAdmin()
                ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
                : null,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Section::class);

        $user = $request->user();
        $branchId = $user->isSuperAdmin() ? null : $user->branch_id;

        return Inertia::render('Admin/Sections/Create', [
            'statusOptions' => Section::STATUSES,
            'termOptions' => $this->termOptions($user, $branchId),
            'courseOptions' => $this->courseOptions($user, $branchId),
            'roomOptions' => $this->roomOptions($user, $branchId),
        ]);
    }

    public function store(StoreSectionRequest $request): RedirectResponse
    {
        $section = Section::create($request->validated());

        Flash::success('Section created successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function show(Section $section): RedirectResponse
    {
        return redirect()->route('admin.sections.edit', $section);
    }

    public function edit(Request $request, Section $section): Response
    {
        $this->authorize('view', $section);

        $section->load([
            'course.orgUnit.branch',
            'term.branch',
            'meetings.room',
            'appointments.user',
        ]);

        $user = $request->user();
        $branchId = $section->branch_id ?: $user->branch_id;

        return Inertia::render('Admin/Sections/Edit', [
            'section' => $this->presentSection($section),
            'statusOptions' => Section::STATUSES,
            'termOptions' => $this->termOptions($user, $branchId),
            'courseOptions' => $this->courseOptions($user, $branchId),
            'roomOptions' => $this->roomOptions($user, $branchId),
            'facultyOptions' => $this->facultyOptions($user, $branchId),
        ]);
    }

    public function update(UpdateSectionRequest $request, Section $section): RedirectResponse
    {
        $data = $request->validated();
        $section->update($data);

        if ($section->wasChanged('status') && $section->status === 'cancelled') {
            // TODO: trigger notification hook in later phase
        }

        Flash::success('Section updated successfully.');

        return redirect()->route('admin.sections.edit', $section);
    }

    public function destroy(Section $section): RedirectResponse
    {
        $this->authorize('delete', $section);

        $section->delete();

        Flash::success('Section deleted successfully.');

        return redirect()->route('admin.sections.index', array_filter([
            'branch_id' => $section->branch_id,
        ]));
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'section_ids' => ['required', 'array'],
            'section_ids.*' => ['integer', Rule::exists('sections', 'id')],
            'status' => ['required', Rule::in(Section::STATUSES)],
        ]);

        $sections = Section::query()->whereIn('id', array_unique($data['section_ids']))->get();

        foreach ($sections as $section) {
            $this->authorize('update', $section);
            $section->update(['status' => $data['status']]);
        }

        Flash::success('Section statuses updated.');

        return redirect()->back();
    }

    protected function termOptions($user, ?int $branchId)
    {
        $query = Term::query()->orderByDesc('start_date');

        if (! $user->isSuperAdmin()) {
            $query->where('branch_id', $user->branch_id);
        } elseif ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->limit(50)->get(['id', 'title', 'code', 'status', 'start_date', 'end_date']);
    }

    protected function courseOptions($user, ?int $branchId)
    {
        $query = Course::query()->with('orgUnit:id,branch_id')->orderBy('code');

        if (! $user->isSuperAdmin()) {
            $query->whereHas('orgUnit', fn ($q) => $q->where('branch_id', $user->branch_id));
        } elseif ($branchId) {
            $query->whereHas('orgUnit', fn ($q) => $q->where('branch_id', $branchId));
        }

        return $query->limit(100)->get(['id', 'code', 'title', 'org_unit_id']);
    }

    protected function roomOptions($user, ?int $branchId)
    {
        $query = Room::query()->where('is_active', true)->orderBy('building')->orderBy('room_no');

        if (! $user->isSuperAdmin()) {
            $query->where('branch_id', $user->branch_id);
        } elseif ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get(['id', 'branch_id', 'building', 'room_no', 'name', 'seats', 'equipment']);
    }

    protected function facultyOptions($user, ?int $branchId)
    {
        $query = User::query()->select(['id', 'name', 'email', 'branch_id'])
            ->whereHas('roles', function ($roleQuery) {
                $roleQuery->whereIn('name', ['lecturer', 'ta', 'admin', 'branch_admin']);
            })
            ->orderBy('name');

        if (! $user->isSuperAdmin()) {
            $query->where('branch_id', $user->branch_id);
        } elseif ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->limit(200)->get();
    }

    protected function presentSection(Section $section): array
    {
        $course = $section->course;
        $term = $section->term;

        return [
            'id' => $section->id,
            'course_id' => $section->course_id,
            'term_id' => $section->term_id,
            'section_code' => $section->section_code,
            'capacity' => $section->capacity,
            'waitlist_cap' => $section->waitlist_cap,
            'status' => $section->status,
            'notes' => $section->notes,
            'branch_id' => $section->branch_id,
            'course' => $course ? [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'org_unit' => $course->orgUnit?->only(['id', 'name', 'branch_id']),
            ] : null,
            'term' => $term ? [
                'id' => $term->id,
                'title' => $term->title,
                'code' => $term->code,
                'status' => $term->status,
                'start_date' => optional($term->start_date)->format('Y-m-d'),
                'end_date' => optional($term->end_date)->format('Y-m-d'),
            ] : null,
            'meetings' => $section->meetings->map(function ($meeting) {
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
            }),
            'appointments' => $section->appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'user_id' => $appointment->user_id,
                    'role' => $appointment->role,
                    'load_percent' => $appointment->load_percent,
                    'assigned_at' => optional($appointment->assigned_at)->toIso8601String(),
                    'user' => $appointment->user?->only(['id', 'name', 'email', 'branch_id']),
                ];
            }),
        ];
    }
}
