<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Transcript\StoreTranscriptRequest;
use App\Http\Requests\Admin\Transcript\UpdateTranscriptRequest;
use App\Models\Branch;
use App\Models\Course;
use App\Models\Term;
use App\Models\Transcript;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TranscriptController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Transcript::class);

        $user = $request->user();
        $search = (string) $request->string('search')->trim();
        $termFilter = $request->integer('term_id');
        $branchFilter = $request->integer('branch_id');
        $courseFilter = $request->integer('course_id');
        $publishedFilter = $request->boolean('published');

        $query = Transcript::query()
            ->with(['student:id,name,email,branch_id', 'course:id,code,title,org_unit_id', 'course.orgUnit:id,branch_id', 'term:id,title,code,branch_id,start_date,end_date']);

        if ($user->isSuperAdmin()) {
            if ($branchFilter) {
                $query->whereHas('course.orgUnit', fn ($builder) => $builder->where('branch_id', $branchFilter));
            }
        } else {
            $query->whereHas('course.orgUnit', fn ($builder) => $builder->where('branch_id', $user->branch_id));
        }

        if ($termFilter) {
            $query->where('term_id', $termFilter);
        }

        if ($courseFilter) {
            $query->where('course_id', $courseFilter);
        }

        if ($search !== '') {
            $query->whereHas('student', function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('published')) {
            $publishedFilter
                ? $query->whereNotNull('published_at')
                : $query->whereNull('published_at');
        }

        $transcripts = $query
            ->orderByDesc('published_at')
            ->orderBy('student_id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Transcript $transcript) => $this->transformTranscript($transcript));

        $branchOptions = $user->isSuperAdmin()
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : Branch::whereKey($user->branch_id)->get(['id', 'name', 'code']);

        $termOptions = Term::query()
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->where('branch_id', $user->branch_id))
            ->orderByDesc('start_date')
            ->get(['id', 'title', 'code', 'branch_id']);

        $courseOptions = Course::query()
            ->with('orgUnit:id,branch_id')
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->whereHas('orgUnit', fn ($inner) => $inner->where('branch_id', $user->branch_id)))
            ->orderBy('code')
            ->limit(100)
            ->get(['id', 'code', 'title', 'org_unit_id']);

        $studentOptions = User::query()
            ->role('student')
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->where('branch_id', $user->branch_id))
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Transcripts/Index', [
            'filters' => [
                'search' => $search,
                'term_id' => $termFilter,
                'course_id' => $courseFilter,
                'branch_id' => $branchFilter,
                'published' => $request->has('published') ? $publishedFilter : null,
            ],
            'transcripts' => $transcripts,
            'termOptions' => $termOptions,
            'courseOptions' => $courseOptions,
            'branchOptions' => $branchOptions,
            'studentOptions' => $studentOptions,
        ]);
    }

    public function store(StoreTranscriptRequest $request): JsonResponse
    {
        $data = $request->validated();
        $transcript = Transcript::create($data);

        return response()->json($this->transformTranscript($transcript->fresh()), 201);
    }

    public function update(UpdateTranscriptRequest $request, Transcript $transcript): JsonResponse
    {
        $data = $request->validated();

        $transcript->fill($data);
        $transcript->save();

        return response()->json($this->transformTranscript($transcript->fresh()));
    }

    public function destroy(Request $request, Transcript $transcript): JsonResponse
    {
        $this->authorize('delete', $transcript);

        $transcript->delete();

        return response()->json(['status' => 'deleted']);
    }

    protected function transformTranscript(Transcript $transcript): array
    {
        return [
            'id' => $transcript->id,
            'student' => [
                'id' => $transcript->student?->id,
                'name' => $transcript->student?->name,
                'email' => $transcript->student?->email,
                'branch_id' => $transcript->student?->branch_id,
            ],
            'course' => [
                'id' => $transcript->course?->id,
                'code' => $transcript->course?->code,
                'title' => $transcript->course?->title,
            ],
            'term' => [
                'id' => $transcript->term?->id,
                'title' => $transcript->term?->title,
                'code' => $transcript->term?->code,
            ],
            'final_grade' => $transcript->final_grade,
            'grade_points' => $transcript->grade_points !== null ? (float) $transcript->grade_points : null,
            'published_at' => $transcript->published_at?->toIso8601String(),
            'created_at' => $transcript->created_at?->toIso8601String(),
            'updated_at' => $transcript->updated_at?->toIso8601String(),
        ];
    }
}
