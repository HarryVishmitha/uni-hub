<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\OrgUnit;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Program::class);

        $user = $request->user();
        $search = (string) $request->string('search')->trim();
        $branchFilter = $request->integer('branch_id');
        $orgUnitFilter = $request->integer('org_unit_id');

        $query = Program::query()->with(['orgUnit:id,name,type,branch_id', 'branch:id,name,code']);

        if ($user->isSuperAdmin()) {
            if ($branchFilter) {
                $query->where('branch_id', $branchFilter);
            }
        } else {
            $query->where('branch_id', $user->branch_id);
        }

        if ($orgUnitFilter) {
            $query->where('org_unit_id', $orgUnitFilter);
        }

        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        $programs = $query
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Program $program) => [
                'id' => $program->id,
                'title' => $program->title,
                'description' => $program->description,
                'level' => $program->level,
                'modality' => $program->modality,
                'duration_months' => $program->duration_months,
                'status' => $program->status,
                'branch' => [
                    'id' => $program->branch->id,
                    'name' => $program->branch->name,
                    'code' => $program->branch->code,
                ],
                'org_unit' => [
                    'id' => $program->orgUnit->id,
                    'name' => $program->orgUnit->name,
                    'type' => $program->orgUnit->type,
                ],
            ]);

        $branches = $user->isSuperAdmin()
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : Branch::whereKey($user->branch_id)->get(['id', 'name', 'code']);

        $orgUnits = OrgUnit::query()
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->where('branch_id', $user->branch_id))
            ->when($user->isSuperAdmin() && $branchFilter, fn ($builder) => $builder->where('branch_id', $branchFilter))
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'branch_id']);

        return Inertia::render('Admin/Programs/Index', [
            'filters' => [
                'search' => $search,
                'branch_id' => $branchFilter,
                'org_unit_id' => $orgUnitFilter,
            ],
            'branches' => $branches,
            'orgUnits' => $orgUnits,
            'programs' => $programs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Program::class);

        $orgUnitId = (int) $request->input('org_unit_id');

        $data = $request->validate([
            'org_unit_id' => ['required', Rule::exists('org_units', 'id')],
            'title' => ['required', 'string', 'max:255', Rule::unique('programs', 'title')->where(fn ($query) => $query->where('org_unit_id', $orgUnitId))],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'max:120'],
            'modality' => ['nullable', 'string', 'max:120'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'status' => ['nullable', 'string', 'max:60'],
        ]);

        $orgUnit = OrgUnit::with('branch')->findOrFail($data['org_unit_id']);

        $this->authorize('view', $orgUnit->branch);

        Program::create([
            'branch_id' => $orgUnit->branch_id,
            'org_unit_id' => $orgUnit->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'level' => $data['level'] ?? null,
            'modality' => $data['modality'] ?? null,
            'duration_months' => $data['duration_months'] ?? null,
            'status' => $data['status'] ?? 'draft',
        ]);

        return back()->with('success', 'Program created successfully.');
    }

    public function update(Request $request, Program $program): RedirectResponse
    {
        $this->authorize('update', $program);

        $orgUnitId = (int) $request->input('org_unit_id', $program->org_unit_id);

        $data = $request->validate([
            'org_unit_id' => ['required', Rule::exists('org_units', 'id')],
            'title' => ['required', 'string', 'max:255', Rule::unique('programs', 'title')->ignore($program->id)->where(fn ($query) => $query->where('org_unit_id', $orgUnitId))],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', 'string', 'max:120'],
            'modality' => ['nullable', 'string', 'max:120'],
            'duration_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'status' => ['nullable', 'string', 'max:60'],
        ]);

        $orgUnit = OrgUnit::with('branch')->findOrFail($data['org_unit_id']);

        $this->authorize('view', $orgUnit->branch);

        $program->update([
            'branch_id' => $orgUnit->branch_id,
            'org_unit_id' => $orgUnit->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'level' => $data['level'] ?? null,
            'modality' => $data['modality'] ?? null,
            'duration_months' => $data['duration_months'] ?? null,
            'status' => $data['status'] ?? $program->status,
        ]);

        return back()->with('success', 'Program updated successfully.');
    }

    public function destroy(Program $program): RedirectResponse
    {
        $this->authorize('delete', $program);

        if ($program->curricula()->exists()) {
            return back()->with('error', 'Archive associated curricula before deleting a program.');
        }

        $program->delete();

        return back()->with('success', 'Program archived successfully.');
    }
}
