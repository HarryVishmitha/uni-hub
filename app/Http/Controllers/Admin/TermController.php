<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTermRequest;
use App\Http\Requests\Admin\UpdateTermRequest;
use App\Models\Branch;
use App\Models\Term;
use App\Support\BranchScope;
use App\Support\Flash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TermController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Term::class);

        $user = $request->user();
        $branchId = $request->integer('branch_id') ?: ($user->isSuperAdmin() ? null : $user->branch_id);

        if ($branchId && ! BranchScope::allows($user, $branchId)) {
            abort(403, 'You cannot view terms for this branch.');
        }

        $search = trim((string) $request->string('search'));
        $status = $request->string('status')->toString();
        $startDate = $request->date('start_date');
        $endDate = $request->date('end_date');

        $termsQuery = Term::query()
            ->with('branch:id,name,code')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($startDate, fn ($q) => $q->whereDate('start_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('end_date', '<=', $endDate));

        $terms = $termsQuery
            ->orderByDesc('start_date')
            ->paginate(15)
            ->withQueryString()
            ->through(function (Term $term) {
                return [
                    'id' => $term->id,
                    'branch_id' => $term->branch_id,
                    'title' => $term->title,
                    'code' => $term->code,
                    'status' => $term->status,
                    'status_label' => ucfirst($term->status),
                    'start_date' => $term->start_date ? date('Y-m-d', strtotime($term->start_date)) : null,
                    'end_date' => $term->end_date ? date('Y-m-d', strtotime($term->end_date)) : null,
                    'add_drop_start' => $term->add_drop_start ? date('Y-m-d', strtotime($term->add_drop_start)) : null,
                    'add_drop_end' => $term->add_drop_end ? date('Y-m-d', strtotime($term->add_drop_end)) : null,
                    'description' => $term->description,
                    'branch' => $term->branch?->only(['id', 'name', 'code']),
                ];
            });

        return Inertia::render('Admin/Terms/Index', [
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
                'status' => $status,
                'start_date' => $startDate ? date('Y-m-d', strtotime($startDate)) : null,
                'end_date' => $endDate ? date('Y-m-d', strtotime($endDate)) : null,
            ],
            'terms' => $terms,
            'statusOptions' => Term::STATUSES,
            'branches' => $user->isSuperAdmin()
                ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
                : null,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Term::class);

        $user = $request->user();
        
        // Get branch options based on user permissions
        $branchOptions = $user->isSuperAdmin()
            ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
            : Branch::query()->where('id', $user->branch_id)->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Terms/Edit', [
            'term' => null,
            'statusOptions' => Term::STATUSES,
            'branchOptions' => $branchOptions,
        ]);
    }

    public function store(StoreTermRequest $request): RedirectResponse
    {
        $data = $request->validated();
        Term::create($data);

        Flash::success('Term created successfully.');

        return redirect()->route('admin.terms.index', array_filter([
            'branch_id' => $request->input('branch_id'),
        ]));
    }

    public function edit(Request $request, Term $term): Response
    {
        $this->authorize('update', $term);

        $term->load('branch:id,name,code');
        
        $user = $request->user();
        
        // Get branch options based on user permissions
        $branchOptions = $user->isSuperAdmin()
            ? Branch::query()->orderBy('name')->get(['id', 'name', 'code'])
            : Branch::query()->where('id', $user->branch_id)->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/Terms/Edit', [
            'term' => [
                'id' => $term->id,
                'branch_id' => $term->branch_id,
                'title' => $term->title,
                'code' => $term->code,
                'status' => $term->status,
                'start_date' => $term->start_date ? date('Y-m-d', strtotime($term->start_date)) : null,
                'end_date' => $term->end_date ? date('Y-m-d', strtotime($term->end_date)) : null,
                'add_drop_start' => $term->add_drop_start ? date('Y-m-d', strtotime($term->add_drop_start)) : null,
                'add_drop_end' => $term->add_drop_end ? date('Y-m-d', strtotime($term->add_drop_end)) : null,
                'description' => $term->description,
                'branch' => $term->branch?->only(['id', 'name', 'code']),
            ],
            'statusOptions' => Term::STATUSES,
            'branchOptions' => $branchOptions,
        ]);
    }

    public function update(UpdateTermRequest $request, Term $term): RedirectResponse
    {
        $data = $request->validated();
        $term->update($data);

        Flash::success('Term updated successfully.');

        return redirect()->route('admin.terms.index', array_filter([
            'branch_id' => $term->branch_id,
        ]));
    }

    public function destroy(Request $request, Term $term): RedirectResponse
    {
        $this->authorize('delete', $term);

        $term->delete();

        Flash::success('Term deleted.');

        return redirect()->route('admin.terms.index', array_filter([
            'branch_id' => $term->branch_id,
        ]));
    }

    public function bulkStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'term_ids' => ['required', 'array'],
            'term_ids.*' => ['integer', Rule::exists('terms', 'id')],
            'status' => ['required', Rule::in(Term::STATUSES)],
        ]);

        $terms = Term::query()->whereIn('id', array_unique($data['term_ids']))->get();

        foreach ($terms as $term) {
            $this->authorize('update', $term);
            $term->update(['status' => $data['status']]);
        }

        Flash::success('Term statuses updated.');

        return redirect()->back();
    }
}
