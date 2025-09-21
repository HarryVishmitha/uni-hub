<?php

namespace App\Policies;

use App\Models\Transcript;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class TranscriptPolicy
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
    public function view(User $user, Transcript $transcript): bool
    {
        if ($transcript->student_id === $user->id) {
            return true;
        }

        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office'])
            && BranchScope::allows($user, $transcript->branch_id);
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
    public function update(User $user, Transcript $transcript): bool
    {
        return $user->hasAnyRole(['admin', 'branch_admin', 'front_office'])
            && BranchScope::allows($user, $transcript->branch_id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Transcript $transcript): bool
    {
        return $this->update($user, $transcript);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Transcript $transcript): bool
    {
        return $this->update($user, $transcript);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Transcript $transcript): bool
    {
        return false;
    }
}
