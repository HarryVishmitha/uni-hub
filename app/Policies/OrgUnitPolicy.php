<?php

namespace App\Policies;

use App\Models\OrgUnit;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class OrgUnitPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability)
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, OrgUnit $orgUnit): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $orgUnit->branch_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, OrgUnit $orgUnit): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $orgUnit->branch_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, OrgUnit $orgUnit): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $orgUnit->branch_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, OrgUnit $orgUnit): bool
    {
        return $this->delete($user, $orgUnit);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, OrgUnit $orgUnit): bool
    {
        return false;
    }
}
