<?php

namespace App\Http\Middleware;

use App\Models\Branch;
use App\Models\Curriculum;
use App\Models\CurriculumRequirement;
use App\Models\OrgUnit;
use App\Models\Program;
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

        $branch = $this->resolveBranchFromRequest($request);

        if ($branch && ! BranchScope::allows($user, $branch->id)) {
            abort(403, 'Cross-branch access is not permitted.');
        }

        if (! $branch && ! $user->isSuperAdmin()) {
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

                if ($parameter instanceof Curriculum) {
                    return $parameter->branch;
                }

                if ($parameter instanceof CurriculumRequirement) {
                    return $parameter->branch;
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
