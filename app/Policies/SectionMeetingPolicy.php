<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\SectionMeeting;
use App\Models\User;
use App\Support\BranchScope;
use Illuminate\Auth\Access\HandlesAuthorization;

class SectionMeetingPolicy
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

    public function view(User $user, SectionMeeting $sectionMeeting): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $this->checkSection($user, $sectionMeeting->section);
    }

    public function create(User $user, Section $section): bool
    {
        if ($user->hasRole('admin')) {
            return $this->termAllowsWrite($section);
        }

        return $this->checkSection($user, $section)
            && $this->termAllowsWrite($section);
    }

    public function update(User $user, SectionMeeting $sectionMeeting): bool
    {
        $section = $sectionMeeting->section;

        if ($user->hasRole('admin')) {
            return $section && $this->termAllowsWrite($section);
        }

        return $section
            && $this->checkSection($user, $section)
            && $this->termAllowsWrite($section);
    }

    public function delete(User $user, SectionMeeting $sectionMeeting): bool
    {
        return $this->update($user, $sectionMeeting);
    }

    public function restore(User $user, SectionMeeting $sectionMeeting): bool
    {
        return $this->update($user, $sectionMeeting);
    }

    public function forceDelete(User $user, SectionMeeting $sectionMeeting): bool
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
