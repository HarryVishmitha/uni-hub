<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\OrganizationalUnit;
use App\Models\User;

class CoursePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->canForOu('view-courses');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Course $course): bool
    {
        return $user->canForOu('view-courses', $this->resolveResourceOu($course));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->canForOu('manage-courses');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Course $course): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->canForOu('manage-courses', $this->resolveResourceOu($course));
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Course $course): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->canForOu('manage-courses', $this->resolveResourceOu($course));
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Course $course): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Course $course): bool
    {
        return false;
    }

    protected function resolveResourceOu(Course $course): ?OrganizationalUnit
    {
        return $course->ownerUnit
            ?? $course->ouContext
            ?? $course->department?->organizationalUnit;
    }
}
