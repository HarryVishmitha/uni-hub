<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\CurriculumRequirement;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Curriculum::class);

        $user = $request->user();
        $search = (string) $request->string('search')->trim();
        $branchFilter = $request->integer('branch_id');
        $programFilter = $request->integer('program_id');

        $query = Curriculum::query()
            ->with(['program.orgUnit', 'branch', 'requirements'])
            ->withCount('requirements');

        if ($user->isSuperAdmin()) {
            if ($branchFilter) {
                $query->where('branch_id', $branchFilter);
            }
        } else {
            $query->where('branch_id', $user->branch_id);
        }

        if ($programFilter) {
            $query->where('program_id', $programFilter);
        }

        if ($search !== '') {
            $query->where('version', 'like', "%{$search}%");
        }

        $curricula = $query
            ->orderByDesc('effective_from')
            ->orderBy('version')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Curriculum $curriculum) => [
                'id' => $curriculum->id,
                'version' => $curriculum->version,
                'status' => $curriculum->status,
                'effective_from' => $curriculum->effective_from?->toDateString(),
                'min_credits' => $curriculum->min_credits,
                'notes' => $curriculum->notes,
                'requirements_count' => $curriculum->requirements_count,
                'branch' => [
                    'id' => $curriculum->branch->id,
                    'name' => $curriculum->branch->name,
                    'code' => $curriculum->branch->code,
                ],
                'program' => [
                    'id' => $curriculum->program->id,
                    'title' => $curriculum->program->title,
                    'org_unit' => [
                        'id' => $curriculum->program->orgUnit->id,
                        'name' => $curriculum->program->orgUnit->name,
                        'type' => $curriculum->program->orgUnit->type,
                    ],
                ],
                'requirements' => $curriculum->requirements->map(fn (CurriculumRequirement $requirement) => [
                    'id' => $requirement->id,
                    'code' => $requirement->code,
                    'title' => $requirement->title,
                    'requirement_type' => $requirement->requirement_type,
                    'credit_value' => $requirement->credit_value,
                    'rules' => $requirement->rules,
                    'is_required' => $requirement->is_required,
                ]),
            ]);

        $programs = Program::query()
            ->with('branch:id,name,code')
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->where('branch_id', $user->branch_id))
            ->when($user->isSuperAdmin() && $branchFilter, fn ($builder) => $builder->where('branch_id', $branchFilter))
            ->orderBy('title')
            ->get(['id', 'title', 'branch_id']);

        return Inertia::render('Admin/Curricula/Index', [
            'filters' => [
                'search' => $search,
                'branch_id' => $branchFilter,
                'program_id' => $programFilter,
            ],
            'curricula' => $curricula,
            'programs' => $programs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Curriculum::class);

        $data = $request->validate([
            'program_id' => ['required', Rule::exists('programs', 'id')],
            'version' => ['required', 'string', 'max:60', Rule::unique('curricula', 'version')->where(fn ($query) => $query->where('program_id', $request->integer('program_id')))],
            'status' => ['nullable', 'string', 'max:60'],
            'effective_from' => ['nullable', 'date'],
            'min_credits' => ['nullable', 'integer', 'min:0', 'max:500'],
            'notes' => ['nullable', 'array'],
        ]);

        $program = Program::with('branch')->findOrFail($data['program_id']);

        $this->authorize('view', $program);

        Curriculum::create([
            'branch_id' => $program->branch_id,
            'program_id' => $program->id,
            'version' => $data['version'],
            'status' => $data['status'] ?? 'draft',
            'effective_from' => $data['effective_from'] ?? null,
            'min_credits' => $data['min_credits'] ?? null,
            'notes' => $data['notes'] ?? [],
        ]);

        return back()->with('success', 'Curriculum created successfully.');
    }

    public function update(Request $request, Curriculum $curriculum): RedirectResponse
    {
        $this->authorize('update', $curriculum);

        $data = $request->validate([
            'version' => ['required', 'string', 'max:60', Rule::unique('curricula', 'version')->ignore($curriculum->id)->where(fn ($query) => $query->where('program_id', $curriculum->program_id))],
            'status' => ['nullable', 'string', 'max:60'],
            'effective_from' => ['nullable', 'date'],
            'min_credits' => ['nullable', 'integer', 'min:0', 'max:500'],
            'notes' => ['nullable', 'array'],
        ]);

        $curriculum->update([
            'version' => $data['version'],
            'status' => $data['status'] ?? $curriculum->status,
            'effective_from' => $data['effective_from'] ?? null,
            'min_credits' => $data['min_credits'] ?? null,
            'notes' => $data['notes'] ?? [],
        ]);

        return back()->with('success', 'Curriculum updated successfully.');
    }

    public function destroy(Curriculum $curriculum): RedirectResponse
    {
        $this->authorize('delete', $curriculum);

        if ($curriculum->requirements()->exists()) {
            return back()->with('error', 'Archive curriculum requirements before deleting the curriculum.');
        }

        $curriculum->delete();

        return back()->with('success', 'Curriculum archived successfully.');
    }

    public function storeRequirement(Request $request, Curriculum $curriculum): RedirectResponse
    {
        $this->authorize('update', $curriculum);

        $data = $request->validate([
            'code' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'requirement_type' => ['required', Rule::in(['core', 'elective'])],
            'credit_value' => ['nullable', 'integer', 'min:0', 'max:50'],
            'rules' => ['nullable', 'array'],
            'is_required' => ['nullable', 'boolean'],
        ]);

        CurriculumRequirement::create([
            'branch_id' => $curriculum->branch_id,
            'curriculum_id' => $curriculum->id,
            'code' => $data['code'] ?? null,
            'title' => $data['title'],
            'requirement_type' => $data['requirement_type'],
            'credit_value' => $data['credit_value'] ?? null,
            'rules' => $data['rules'] ?? [],
            'is_required' => $data['is_required'] ?? $data['requirement_type'] === 'core',
        ]);

        return back()->with('success', 'Requirement added successfully.');
    }

    public function updateRequirement(Request $request, Curriculum $curriculum, CurriculumRequirement $requirement): RedirectResponse
    {
        $this->authorize('update', $curriculum);

        if ($requirement->curriculum_id !== $curriculum->id) {
            abort(403);
        }

        $data = $request->validate([
            'code' => ['nullable', 'string', 'max:50'],
            'title' => ['required', 'string', 'max:255'],
            'requirement_type' => ['required', Rule::in(['core', 'elective'])],
            'credit_value' => ['nullable', 'integer', 'min:0', 'max:50'],
            'rules' => ['nullable', 'array'],
            'is_required' => ['nullable', 'boolean'],
        ]);

        $requirement->update([
            'code' => $data['code'] ?? null,
            'title' => $data['title'],
            'requirement_type' => $data['requirement_type'],
            'credit_value' => $data['credit_value'] ?? null,
            'rules' => $data['rules'] ?? [],
            'is_required' => $data['is_required'] ?? $data['requirement_type'] === 'core',
        ]);

        return back()->with('success', 'Requirement updated successfully.');
    }

    public function destroyRequirement(Curriculum $curriculum, CurriculumRequirement $requirement): RedirectResponse
    {
        $this->authorize('update', $curriculum);

        if ($requirement->curriculum_id !== $curriculum->id) {
            abort(403);
        }

        $requirement->delete();

        return back()->with('success', 'Requirement archived successfully.');
    }
}
