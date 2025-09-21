<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class SectionPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin']);
    }

    public function view(User $user, Section $section): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $section->branch_id);
    }

    public function create(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && $user->branch_id !== null;
    }

    public function update(User $user, Section $section): bool
    {
        if ($user->hasRole('admin')) {
            return in_array($section->term?->status, ['planned', 'active'], true);
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $section->branch_id)
            && $this->termAllowsWrite($section);
    }

    public function delete(User $user, Section $section): bool
    {
        return $this->update($user, $section);
    }

    public function restore(User $user, Section $section): bool
    {
        return $this->update($user, $section);
    }

    public function forceDelete(User $user, Section $section): bool
    {
        return false;
    }

    protected function termAllowsWrite(Section $section): bool
    {
        $status = $section->term?->status;

        return in_array($status, ['planned', 'active'], true);
    }
}
