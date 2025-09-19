<?php

namespace App\Policies;

use App\Models\Curriculum;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class CurriculumPolicy
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
    public function view(User $user, Curriculum $curriculum): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $curriculum->branch_id);
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
    public function update(User $user, Curriculum $curriculum): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $curriculum->branch_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Curriculum $curriculum): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin'])
            && BranchScope::allows($user, $curriculum->branch_id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Curriculum $curriculum): bool
    {
        return $this->delete($user, $curriculum);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Curriculum $curriculum): bool
    {
        return false;
    }
}
