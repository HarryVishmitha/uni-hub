<?php

namespace App\Policies;

use App\Models\Room;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class RoomPolicy
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

    public function view(User $user, Room $room): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $room->branch_id);
    }

    public function create(User $user): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && $user->branch_id !== null;
    }

    public function update(User $user, Room $room): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $room->branch_id);
    }

    public function delete(User $user, Room $room): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $room->branch_id);
    }

    public function restore(User $user, Room $room): bool
    {
        return $this->delete($user, $room);
    }

    public function forceDelete(User $user, Room $room): bool
    {
        return false;
    }
}
