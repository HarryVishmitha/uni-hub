<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourseRequest;
use App\Http\Requests\Admin\UpdateCourseRequest;
use App\Models\Branch;
use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\OrgUnit;
use App\Models\User;
use App\Support\BranchScope;
use App\Support\Flash;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Course::class);

        $user = $request->user();
        $branchId = $this->resolveBranchId($user, $request->integer('branch_id'));
        $orgUnitId = $request->integer('org_unit_id');
        $status = (string) $request->string('status');
        $deliveryMode = (string) $request->string('delivery_mode');
        $search = trim((string) $request->string('search'));

        $courses = $this->queryCourses(
            branchId: $branchId,
            orgUnitId: $orgUnitId,
            status: $status,
            deliveryMode: $deliveryMode,
            search: $search
        )->paginate(15)
            ->withQueryString()
            ->through(fn (Course $course) => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'status' => $course->status,
                'delivery_mode' => $course->delivery_mode,
                'credit_hours' => $course->credit_hours,
                'org_unit' => $course->orgUnit?->only(['id', 'name', 'code', 'type']),
                'branch' => $course->orgUnit?->branch?->only(['id', 'name', 'code']),
                'updated_at' => optional($course->updated_at)->toDateTimeString(),
            ]);

        $branchOptions = $user->isSuperAdmin()
            ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
            : Branch::query()->whereKey($user->branch_id)->get(['id', 'name', 'code']);

        $orgUnits = $this->orgUnitsForFilters($user, $branchId);

        return Inertia::render('Admin/Courses/Index', [
            'filters' => [
                'branch_id' => $branchId,
                'org_unit_id' => $orgUnitId,
                'status' => $status ?: null,
                'delivery_mode' => $deliveryMode ?: null,
                'search' => $search,
            ],
            'courses' => $courses,
            'statusOptions' => Course::STATUSES,
            'deliveryModeOptions' => Course::DELIVERY_MODES,
            'branchOptions' => $branchOptions,
            'orgUnitTree' => $this->buildOrgUnitTree($orgUnits),
            'orgUnitFlat' => $orgUnits->map(fn (OrgUnit $unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'type' => $unit->type,
                'parent_id' => $unit->parent_id,
                'branch_id' => $unit->branch_id,
            ])->values(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Course::class);

        $user = $request->user();
        $branchId = $this->resolveBranchId($user, $request->integer('branch_id'));
        $orgUnits = $this->orgUnitsForFilters($user, $branchId);
        $availableCourses = $this->queryCourses(branchId: $branchId)
            ->limit(200)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'branch_id' => $course->branch_id,
            ]);

        return Inertia::render('Admin/Courses/Create', [
            'statusOptions' => Course::STATUSES,
            'deliveryModeOptions' => Course::DELIVERY_MODES,
            'branchOptions' => $user->isSuperAdmin()
                ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
                : Branch::query()->whereKey($user->branch_id)->get(['id', 'name', 'code']),
            'orgUnitTree' => $this->buildOrgUnitTree($orgUnits),
            'availableCourses' => $availableCourses,
        ]);
    }

    public function store(StoreCourseRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $course = DB::transaction(function () use ($data, $request, $user) {
            /** @var Course $course */
            $course = Course::create([
                'org_unit_id' => $data['org_unit_id'],
                'code' => strtoupper($data['code']),
                'title' => $data['title'],
                'credit_hours' => $data['credit_hours'],
                'delivery_mode' => $data['delivery_mode'],
                'status' => $data['status'],
            ]);

            $outcomes = collect($data['outcomes'] ?? []);
            foreach ($outcomes as $outcome) {
                $course->outcomes()->create([
                    'outcome_code' => strtoupper($outcome['outcome_code']),
                    'description' => $outcome['description'],
                ]);
            }

            $prerequisites = collect($data['prerequisites'] ?? []);
            foreach ($prerequisites as $prerequisite) {
                $course->prerequisites()->attach($prerequisite['prereq_course_id'], [
                    'min_grade' => $prerequisite['min_grade'] ?? null,
                ]);
            }

            return $course;
        });

        Flash::success('Course created successfully.');

        return redirect()->route('admin.courses.show', $course);
    }

    public function show(Request $request, Course $course): Response
    {
        $this->authorize('view', $course);

        $course->load([
            'orgUnit:id,name,code,type,parent_id,branch_id',
            'orgUnit.branch:id,name,code',
            'outcomes:id,course_id,outcome_code,description',
            'prerequisites' => fn ($query) => $query->select('courses.id', 'courses.code', 'courses.title')->withPivot('min_grade'),
        ]);

        $availablePrerequisites = $this->queryCourses(
            branchId: $course->branch_id,
            excludeCourseId: $course->id
        )->limit(50)->get()->map(fn (Course $candidate) => [
            'id' => $candidate->id,
            'code' => $candidate->code,
            'title' => $candidate->title,
        ]);

        return Inertia::render('Admin/Courses/Show', [
            'course' => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'status' => $course->status,
                'delivery_mode' => $course->delivery_mode,
                'credit_hours' => $course->credit_hours,
                'org_unit' => $course->orgUnit?->only(['id', 'name', 'code', 'type']),
                'branch' => $course->orgUnit?->branch?->only(['id', 'name', 'code']),
                'updated_at' => optional($course->updated_at)->toDateTimeString(),
                'outcomes' => $course->outcomes->map(fn (CourseOutcome $outcome) => [
                    'id' => $outcome->id,
                    'outcome_code' => $outcome->outcome_code,
                    'description' => $outcome->description,
                ]),
                'prerequisites' => $course->prerequisites->map(fn (Course $prereq) => [
                    'id' => $prereq->id,
                    'code' => $prereq->code,
                    'title' => $prereq->title,
                    'min_grade' => $prereq->pivot?->min_grade,
                ]),
            ],
            'statusOptions' => Course::STATUSES,
            'deliveryModeOptions' => Course::DELIVERY_MODES,
            'availablePrerequisites' => $availablePrerequisites,
        ]);
    }

    public function edit(Request $request, Course $course): Response
    {
        $this->authorize('update', $course);

        $course->load('orgUnit.branch:id,name,code');

        $branchOptions = $request->user()->isSuperAdmin()
            ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
            : Branch::query()->whereKey($course->branch_id)->get(['id', 'name', 'code']);

        $orgUnits = $this->orgUnitsForFilters($request->user(), $course->branch_id);

        return Inertia::render('Admin/Courses/Edit', [
            'course' => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'status' => $course->status,
                'delivery_mode' => $course->delivery_mode,
                'credit_hours' => $course->credit_hours,
                'org_unit_id' => $course->org_unit_id,
                'branch_id' => $course->branch_id,
            ],
            'statusOptions' => Course::STATUSES,
            'deliveryModeOptions' => Course::DELIVERY_MODES,
            'branchOptions' => $branchOptions,
            'orgUnitTree' => $this->buildOrgUnitTree($orgUnits),
        ]);
    }

    public function update(UpdateCourseRequest $request, Course $course): RedirectResponse
    {
        $data = $request->validated();

        $course->update([
            'code' => strtoupper($data['code']),
            'title' => $data['title'],
            'credit_hours' => $data['credit_hours'],
            'delivery_mode' => $data['delivery_mode'],
            'status' => $data['status'],
        ]);

        Flash::success('Course updated successfully.');

        return redirect()->route('admin.courses.show', $course);
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

        $course->delete();

        Flash::success('Course archived successfully.');

        return redirect()->route('admin.courses.index');
    }

    protected function resolveBranchId(User $user, ?int $requested): ?int
    {
        if ($user->isSuperAdmin()) {
            if ($requested && Branch::query()->whereKey($requested)->exists()) {
                return $requested;
            }

            return null;
        }

        if ($requested && BranchScope::allows($user, $requested)) {
            return $requested;
        }

        return $user->branch_id;
    }

    protected function queryCourses(
        ?int $branchId = null,
        ?int $orgUnitId = null,
        ?string $status = null,
        ?string $deliveryMode = null,
        string $search = '',
        ?int $excludeCourseId = null
    ) {
        return Course::query()
            ->with(['orgUnit:id,name,code,type,parent_id,branch_id', 'orgUnit.branch:id,name,code'])
            ->when($branchId, function ($query) use ($branchId) {
                $query->whereHas('orgUnit', fn ($orgUnitQuery) => $orgUnitQuery->where('branch_id', $branchId));
            })
            ->when($orgUnitId, fn ($query) => $query->where('org_unit_id', $orgUnitId))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($deliveryMode, fn ($query) => $query->where('delivery_mode', $deliveryMode))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder->where('code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%");
                });
            })
            ->when($excludeCourseId, fn ($query) => $query->where('id', '!=', $excludeCourseId));
    }

    protected function orgUnitsForFilters(User $user, ?int $branchId): Collection
    {
        $query = OrgUnit::query()
            ->with('branch:id,name,code')
            ->orderBy('type')
            ->orderBy('name');

        if ($user->isSuperAdmin()) {
            if ($branchId) {
                $query->where('branch_id', $branchId);
            }
        } else {
            $query->where('branch_id', $user->branch_id);
        }

        return $query->get(['id', 'name', 'code', 'type', 'parent_id', 'branch_id']);
    }

    protected function buildOrgUnitTree(Collection $orgUnits): array
    {
        /** @var \Illuminate\Support\Collection<int, array> $grouped */
        $grouped = $orgUnits->groupBy('branch_id');

        return $grouped->map(function (Collection $units) {
            return $this->toTree($units->map(fn (OrgUnit $unit) => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'type' => $unit->type,
                'parent_id' => $unit->parent_id,
            ]));
        })->toArray();
    }

    protected function toTree(Collection $items): array
    {
        $lookup = [];
        $tree = [];

        foreach ($items as $item) {
            $item['children'] = [];
            $lookup[$item['id']] = $item;
        }

        foreach ($lookup as $id => &$node) {
            if ($node['parent_id'] && isset($lookup[$node['parent_id']])) {
                $lookup[$node['parent_id']]['children'][] = &$node;
            } else {
                $tree[] = &$node;
            }
        }

        // Clean up references
        return array_map(function ($node) {
            $node['children'] = array_values($node['children']);
            return $node;
        }, $tree);
    }
}
