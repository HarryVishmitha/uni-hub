<?php

namespace App\Policies;

use App\Models\SectionEnrollment;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class SectionEnrollmentPolicy
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
        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SectionEnrollment $sectionEnrollment): bool
    {
        if ($sectionEnrollment->student_id === $user->id) {
            return true;
        }

        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office'])
            && BranchScope::allows($user, $sectionEnrollment->branch_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SectionEnrollment $sectionEnrollment): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office'])
            && BranchScope::allows($user, $sectionEnrollment->branch_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SectionEnrollment $sectionEnrollment): bool
    {
        return $this->update($user, $sectionEnrollment);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SectionEnrollment $sectionEnrollment): bool
    {
        return $this->update($user, $sectionEnrollment);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SectionEnrollment $sectionEnrollment): bool
    {
        return false;
    }
}
