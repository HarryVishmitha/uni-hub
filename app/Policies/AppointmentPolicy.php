<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\Section;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class AppointmentPolicy
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

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $this->checkSection($user, $appointment->section);
    }

    public function create(User $user, Section $section): bool
    {
        if ($user->hasRole('admin')) {
            return $this->termAllowsWrite($section);
        }

        return $this->checkSection($user, $section)
            && $this->termAllowsWrite($section);
    }

    public function update(User $user, Appointment $appointment): bool
    {
        $section = $appointment->section;

        if ($user->hasRole('admin')) {
            return $section && $this->termAllowsWrite($section);
        }

        return $section
            && $this->checkSection($user, $section)
            && $this->termAllowsWrite($section);
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $this->update($user, $appointment);
    }

    public function restore(User $user, Appointment $appointment): bool
    {
        return $this->update($user, $appointment);
    }

    public function forceDelete(User $user, Appointment $appointment): bool
    {
        return false;
    }

    protected function checkSection(User $user, ?Section $section): bool
    {
        if (! $section) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('branch_admin')
            && BranchScope::allows($user, $section->branch_id);
    }

    protected function termAllowsWrite(?Section $section): bool
    {
        if (! $section) {
            return false;
        }

        $status = $section->term?->status;

        return in_array($status, ['planned', 'active'], true);
    }
}
