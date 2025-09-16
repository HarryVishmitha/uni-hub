<?php

namespace App\Support\Unite;

use App\Contracts\Unite\OuAccessResolver as OuAccessResolverContract;
use App\Enums\ScopeMode;
use App\Models\OrganizationalUnit;
use App\Models\User;
use App\Support\Unite\Cache\EffectiveScopeCache;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class OuAccessResolver implements OuAccessResolverContract
{
    public function allows(User $user, string $permission, OrganizationalUnit|int|null $organizationalUnit = null): bool
    {
        if (! $user->hasPermissionTo($permission)) {
            return false;
        }

        $scopeData = $this->effectiveUnits($user);
        $isGlobal = (bool) $scopeData->get('global', false);
        $unitIds = $scopeData->get('unit_ids', collect());

        if ($organizationalUnit instanceof OrganizationalUnit) {
            $targetOuId = $organizationalUnit->getKey();
        } else {
            $targetOuId = $organizationalUnit;
        }

        if ($isGlobal || $targetOuId === null) {
            return true;
        }

        $allowed = $unitIds->contains((int) $targetOuId);

        if (! $allowed && ! config('unite.enforce', false)) {
            $this->logObservation($user, $permission, $targetOuId, $unitIds);

            return true;
        }

        return $allowed;
    }

    public function effectiveUnits(User $user): Collection
    {
        return EffectiveScopeCache::remember($user, function () use ($user) {
            $appointments = $user->activeAppointments()
                ->with(['organizationalUnit'])
                ->get();

            if ($appointments->isEmpty()) {
                return collect([
                    'global' => false,
                    'unit_ids' => collect(),
                ]);
            }

            $global = false;
            $unitIds = collect();

            foreach ($appointments as $appointment) {
                $scope = $appointment->scope_mode instanceof ScopeMode
                    ? $appointment->scope_mode
                    : ScopeMode::from($appointment->scope_mode);

                if ($scope->isGlobal()) {
                    $global = true;
                    continue;
                }

                if (! $appointment->organizationalUnit) {
                    continue;
                }

                if ($scope->includesDescendants()) {
                    $unitIds = $unitIds->merge(
                        $appointment->organizationalUnit->descendantIds(true)
                    );

                    continue;
                }

                $unitIds->push($appointment->organizationalUnit->getKey());
            }

            return collect([
                'global' => $global,
                'unit_ids' => $unitIds->unique()->values(),
            ]);
        });
    }

    protected function logObservation(User $user, string $permission, int $targetOuId, Collection $unitIds): void
    {
        if (! config('unite.log_observations', true)) {
            return;
        }

        Log::info('Unite observation: denied by scope but allowed (observe mode).', [
            'user_id' => $user->getKey(),
            'permission' => $permission,
            'requested_ou_id' => $targetOuId,
            'effective_units' => $unitIds->all(),
        ]);
    }
}
