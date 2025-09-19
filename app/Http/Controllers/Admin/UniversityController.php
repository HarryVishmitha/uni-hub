<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UniversityController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', University::class);

        $search = (string) $request->string('search')->trim();

        $universities = University::query()
            ->withCount('branches')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (University $university) => [
                'id' => $university->id,
                'name' => $university->name,
                'code' => $university->code,
                'domain' => $university->domain,
                'is_active' => $university->is_active,
                'branches_count' => $university->branches_count,
                'deleted_at' => $university->deleted_at,
            ]);

        return Inertia::render('Admin/Universities/Index', [
            'filters' => [
                'search' => $search,
            ],
            'universities' => $universities,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', University::class);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', 'unique:universities,code'],
            'domain' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['is_active'] = $data['is_active'] ?? true;

        University::create($data);

        return back()->with('success', 'University created successfully.');
    }

    public function update(Request $request, University $university): RedirectResponse
    {
        $this->authorize('update', $university);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', Rule::unique('universities', 'code')->ignore($university->id)],
            'domain' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['is_active'] = $data['is_active'] ?? $university->is_active;

        $university->update($data);

        return back()->with('success', 'University updated successfully.');
    }

    public function destroy(University $university): RedirectResponse
    {
        $this->authorize('delete', $university);

        if ($university->branches()->exists()) {
            return back()->with('error', 'Cannot delete a university while branches exist.');
        }

        $university->delete();

        return back()->with('success', 'University archived successfully.');
    }
}
