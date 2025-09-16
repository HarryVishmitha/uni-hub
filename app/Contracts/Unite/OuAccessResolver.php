<?php

namespace App\Contracts\Unite;

use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Support\Collection;

interface OuAccessResolver
{
    public function allows(User $user, string $permission, OrganizationalUnit|int|null $organizationalUnit = null): bool;

    public function effectiveUnits(User $user): Collection;
}
