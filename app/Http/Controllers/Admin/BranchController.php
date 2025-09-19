<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Branch::class);

        $user = $request->user();
        $search = (string) $request->string('search')->trim();
        $universityId = $request->integer('university_id');

        $query = Branch::query()
            ->with(['university'])
            ->withCount(['orgUnits', 'programs']);

        if (! $user->isSuperAdmin() && $user->branch_id) {
            $query->whereKey($user->branch_id);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        $branches = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Branch $branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code,
                'city' => $branch->city,
                'country' => $branch->country,
                'timezone' => $branch->timezone,
                'theme_tokens' => $branch->theme_tokens,
                'feature_flags' => $branch->feature_flags,
                'is_active' => $branch->is_active,
                'org_units_count' => $branch->org_units_count,
                'programs_count' => $branch->programs_count,
                'university' => [
                    'id' => $branch->university->id,
                    'name' => $branch->university->name,
                ],
            ]);

        return Inertia::render('Admin/Branches/Index', [
            'filters' => [
                'search' => $search,
                'university_id' => $universityId,
            ],
            'universities' => University::orderBy('name')->get(['id', 'name']),
            'branches' => $branches,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Branch::class);

        $data = $request->validate([
            'university_id' => ['required', Rule::exists('universities', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', Rule::unique('branches', 'code')->where(fn ($q) => $q->where('university_id', $request->integer('university_id')))],
            'country' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'timezone' => ['required', 'string', 'max:120'],
            'theme_tokens' => ['nullable', 'array'],
            'feature_flags' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['theme_tokens'] = $data['theme_tokens'] ?? [];
        $data['feature_flags'] = $data['feature_flags'] ?? [];
        $data['is_active'] = $data['is_active'] ?? true;

        Branch::create($data);

        return back()->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorize('update', $branch);

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', Rule::unique('branches', 'code')->ignore($branch->id)->where(fn ($q) => $q->where('university_id', $branch->university_id))],
            'country' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'timezone' => ['required', 'string', 'max:120'],
            'theme_tokens' => ['nullable', 'array'],
            'feature_flags' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];

        if ($request->user()->isSuperAdmin()) {
            $rules['university_id'] = ['required', Rule::exists('universities', 'id')];
        }

        $data = $request->validate($rules);

        if (isset($data['university_id'])) {
            $branch->university_id = $data['university_id'];
        }

        $branch->fill([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'country' => $data['country'] ?? null,
            'city' => $data['city'] ?? null,
            'timezone' => $data['timezone'],
            'theme_tokens' => $data['theme_tokens'] ?? [],
            'feature_flags' => $data['feature_flags'] ?? [],
            'is_active' => $data['is_active'] ?? $branch->is_active,
        ])->save();

        return back()->with('success', 'Branch updated successfully.');
    }

    public function destroy(Request $request, Branch $branch): RedirectResponse
    {
        $this->authorize('delete', $branch);

        if ($branch->orgUnits()->exists() || $branch->programs()->exists()) {
            return back()->with('error', 'Archive or reassign dependent records before deleting this branch.');
        }

        if ($request->user()->branch_id === $branch->id) {
            return back()->with('error', 'You cannot delete the branch you are assigned to.');
        }

        $branch->delete();

        return back()->with('success', 'Branch archived successfully.');
    }
}
