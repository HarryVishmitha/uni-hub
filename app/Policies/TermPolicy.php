<?php

namespace App\Policies;

use App\Models\Term;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class TermPolicy
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

    public function view(User $user, Term $term): bool
    {
        return BranchScope::allows($user, $term->branch_id);
    }

    public function create(User $user): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return (bool) $user->branch_id;
    }

    public function update(User $user, Term $term): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return BranchScope::allows($user, $term->branch_id);
    }

    public function delete(User $user, Term $term): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return BranchScope::allows($user, $term->branch_id);
    }
}
