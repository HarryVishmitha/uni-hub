<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\OrganizationalUnit;
use App\Models\User;

class EnrollmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->canForOu('view-enrollments');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Enrollment $enrollment): bool
    {
        if ($enrollment->user_id === $user->id) {
            return true;
        }

        if ($user->hasRole('admin')) {
            return $user->canForOu('view-enrollments', $this->resolveResourceOu($enrollment));
        }

        return $user->canForOu('view-enrollments', $this->resolveResourceOu($enrollment));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->canForOu('manage-enrollments');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Enrollment $enrollment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->canForOu('manage-enrollments', $this->resolveResourceOu($enrollment));
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Enrollment $enrollment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($enrollment->user_id === $user->id) {
            return true;
        }

        return $user->canForOu('manage-enrollments', $this->resolveResourceOu($enrollment));
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Enrollment $enrollment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Enrollment $enrollment): bool
    {
        return false;
    }

    protected function resolveResourceOu(Enrollment $enrollment): ?OrganizationalUnit
    {
        return $enrollment->organizationalUnit
            ?? $enrollment->course?->deliveryUnit
            ?? $enrollment->course?->ownerUnit
            ?? $enrollment->ouContext;
    }
}
