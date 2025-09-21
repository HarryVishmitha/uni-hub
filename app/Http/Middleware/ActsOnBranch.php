<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Curriculum;
use App\Models\CurriculumRequirement;
use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\CoursePrerequisite;
use App\Models\OrgUnit;
use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\Transcript;
use App\Support\BranchScope;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActsOnBranch
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(401);
        }

        // Allow Super Admin to access without branch constraint
        if ($user->isSuperAdmin()) {
            $branch = $this->resolveBranchFromRequest($request);
            
            if ($branch) {
                app()->instance('activeBranch', $branch);
                $request->attributes->set('activeBranch', $branch);
                $request->attributes->set('activeBranchId', $branch->id);
            }
            
            return $next($request);
        }

        $branch = $this->resolveBranchFromRequest($request);

        if ($branch && ! BranchScope::allows($user, $branch->id)) {
            abort(403, 'Cross-branch access is not permitted.');
        }

        if (! $branch) {
            $branch = $user->branch;

            if (! $branch) {
                abort(403, 'A branch context is required to access this resource.');
            }
        }

        if ($branch) {
            app()->instance('activeBranch', $branch);
            $request->attributes->set('activeBranch', $branch);
            $request->attributes->set('activeBranchId', $branch->id);
        }

        return $next($request);
    }

    private function resolveBranchFromRequest(Request $request): ?Branch
    {
        $route = $request->route();

        if ($route) {
            foreach ($route->parameters() as $parameter) {
                if ($parameter instanceof Branch) {
                    return $parameter;
                }

                if ($parameter instanceof OrgUnit) {
                    return $parameter->branch;
                }

                if ($parameter instanceof Program) {
                    return $parameter->branch;
                }

                if ($parameter instanceof ProgramEnrollment) {
                    return $parameter->program?->branch;
                }

                if ($parameter instanceof Curriculum) {
                    return $parameter->branch;
                }

                if ($parameter instanceof CurriculumRequirement) {
                    return $parameter->branch;
                }

                if ($parameter instanceof Term) {
                    return $parameter->branch;
                }

                if ($parameter instanceof Course) {
                    return $parameter->orgUnit?->branch;
                }

                if ($parameter instanceof CourseOutcome) {
                    return $parameter->course?->orgUnit?->branch;
                }

                if ($parameter instanceof CoursePrerequisite) {
                    return $parameter->course?->orgUnit?->branch;
                }

                if ($parameter instanceof SectionEnrollment) {
                    return $parameter->section?->course?->orgUnit?->branch;
                }

                if ($parameter instanceof Transcript) {
                    return $parameter->course?->orgUnit?->branch;
                }
            }
        }

        $branchId = $request->integer('branch_id') ?: null;

        if ($branchId) {
            return Branch::query()->find($branchId);
        }

        return null;
    }
}
