<?php

namespace App\Support;

use App\Models\Branch;
use App\Models\User;

class BranchScope
{
    public static function allows(User $user, ?int $branchId): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($branchId === null) {
            return false;
        }

        return (int) $user->branch_id === (int) $branchId;
    }

    public static function resolveActiveBranch(User $user, ?Branch $branch = null): ?Branch
    {
        if ($user->isSuperAdmin()) {
            return $branch;
        }

        return $user->branch;
    }
}
