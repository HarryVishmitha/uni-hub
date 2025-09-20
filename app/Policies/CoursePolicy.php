<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoursePolicy
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

    public function view(User $user, Course $course): bool
    {
        return $this->allowsBranch($user, $course->branch_id);
    }

    public function create(User $user): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return (bool) $user->branch_id;
    }

    public function update(User $user, Course $course): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return $this->allowsBranch($user, $course->branch_id);
    }

    public function delete(User $user, Course $course): bool
    {
        if (! $user->hasAnyRole(['admin', 'branch_admin'])) {
            return false;
        }

        return $this->allowsBranch($user, $course->branch_id);
    }

    protected function allowsBranch(User $user, ?int $branchId): bool
    {
        return BranchScope::allows($user, $branchId);
    }
}
