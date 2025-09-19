<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\OrgUnit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrgUnitController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', OrgUnit::class);

        $user = $request->user();
        $search = (string) $request->string('search')->trim();
        $branchFilter = $request->integer('branch_id');

        $query = OrgUnit::query()->with(['parent:id,name', 'branch:id,name,code']);

        if ($user->isSuperAdmin()) {
            if ($branchFilter) {
                $query->where('branch_id', $branchFilter);
            }
        } else {
            $query->where('branch_id', $user->branch_id);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $orgUnits = $query
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(fn (OrgUnit $orgUnit) => [
                'id' => $orgUnit->id,
                'name' => $orgUnit->name,
                'code' => $orgUnit->code,
                'type' => $orgUnit->type,
                'parent_id' => $orgUnit->parent_id,
                'branch' => [
                    'id' => $orgUnit->branch->id,
                    'name' => $orgUnit->branch->name,
                    'code' => $orgUnit->branch->code,
                ],
                'parent' => $orgUnit->parent ? [
                    'id' => $orgUnit->parent->id,
                    'name' => $orgUnit->parent->name,
                    'type' => $orgUnit->parent->type,
                ] : null,
            ]);

        $branches = $user->isSuperAdmin()
            ? Branch::orderBy('name')->get(['id', 'name', 'code'])
            : Branch::whereKey($user->branch_id)->get(['id', 'name', 'code']);

        $parentOptions = OrgUnit::query()
            ->when(! $user->isSuperAdmin(), fn ($builder) => $builder->where('branch_id', $user->branch_id))
            ->when($user->isSuperAdmin() && $branchFilter, fn ($builder) => $builder->where('branch_id', $branchFilter))
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'branch_id']);

        return Inertia::render('Admin/OrgUnits/Index', [
            'filters' => [
                'search' => $search,
                'branch_id' => $branchFilter,
            ],
            'branches' => $branches,
            'orgUnits' => $orgUnits,
            'types' => OrgUnit::TYPES,
            'parentOptions' => $parentOptions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', OrgUnit::class);

        $user = $request->user();

        $data = $request->validate($this->rules($request, null));

        $branchId = $user->isSuperAdmin() ? $data['branch_id'] : $user->branch_id;

        $this->guardBranchAccess($user->isSuperAdmin(), $branchId);

        $parentId = $data['parent_id'] ?? null;

        if ($parentId) {
            $this->guardParent($parentId, $branchId);
        }

        OrgUnit::create([
            'branch_id' => $branchId,
            'parent_id' => $parentId,
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
        ]);

        return back()->with('success', 'Org unit created successfully.');
    }

    public function update(Request $request, OrgUnit $orgUnit): RedirectResponse
    {
        $this->authorize('update', $orgUnit);

        $data = $request->validate($this->rules($request, $orgUnit));

        $branchId = $orgUnit->branch_id;

        $parentId = $data['parent_id'] ?? null;

        if ($parentId) {
            $this->guardParent($parentId, $branchId, $orgUnit);
        }

        if ($parentId === $orgUnit->id) {
            return back()->with('error', 'An org unit cannot be its own parent.');
        }

        $orgUnit->update([
            'parent_id' => $parentId,
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'type' => $data['type'],
        ]);

        return back()->with('success', 'Org unit updated successfully.');
    }

    public function destroy(OrgUnit $orgUnit): RedirectResponse
    {
        $this->authorize('delete', $orgUnit);

        if ($orgUnit->children()->exists() || $orgUnit->programs()->exists()) {
            return back()->with('error', 'Archive child org units and programs before deleting this node.');
        }

        $orgUnit->delete();

        return back()->with('success', 'Org unit archived successfully.');
    }

    private function rules(Request $request, ?OrgUnit $orgUnit): array
    {
        $user = $request->user();
        $branchId = $user->isSuperAdmin()
            ? $request->integer('branch_id')
            : $user->branch_id;

        $uniqueRule = Rule::unique('org_units', 'code')
            ->when($branchId, fn ($rule) => $rule->where('branch_id', $branchId));

        if ($orgUnit) {
            $uniqueRule->ignore($orgUnit->id);
            $branchId = $orgUnit->branch_id;
        }

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', $uniqueRule],
            'type' => ['required', Rule::in(OrgUnit::TYPES)],
            'parent_id' => ['nullable', Rule::exists('org_units', 'id')->when($branchId, fn ($rule) => $rule->where('branch_id', $branchId))],
        ];

        if ($user->isSuperAdmin() && ! $orgUnit) {
            $rules['branch_id'] = ['required', Rule::exists('branches', 'id')];
        }

        return $rules;
    }

    private function guardBranchAccess(bool $isSuperAdmin, ?int $branchId): void
    {
        if (! $branchId) {
            abort(422, 'Branch context is required.');
        }

        if ($isSuperAdmin) {
            return;
        }
    }

    private function guardParent(int $parentId, int $branchId, ?OrgUnit $current = null): void
    {
        $parent = OrgUnit::where('branch_id', $branchId)->findOrFail($parentId);

        if ($current && $this->isDescendant($parent, $current)) {
            abort(422, 'Cannot assign a descendant as the parent.');
        }
    }

    private function isDescendant(OrgUnit $possibleParent, OrgUnit $current): bool
    {
        $check = $possibleParent;

        while ($check) {
            if ($check->id === $current->id) {
                return true;
            }

            $check = $check->parent;
        }

        return false;
    }
}
