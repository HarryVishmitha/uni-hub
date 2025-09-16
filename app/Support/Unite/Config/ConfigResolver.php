<?php

namespace App\Support\Unite\Config;

use App\Models\ConfigOverride;
use App\Models\OrganizationalUnit;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class ConfigResolver
{
    public function resolve(?OrganizationalUnit $unit, string $key, mixed $default = null): mixed
    {
        $trail = $this->buildTrail($unit);

        if ($trail->isEmpty()) {
            return $default;
        }

        $overrides = ConfigOverride::query()
            ->where('key', $key)
            ->whereIn('ou_id', $trail)
            ->orderByDesc('ou_id')
            ->get()
            ->keyBy('ou_id');

        foreach ($trail as $ouId) {
            if (! $overrides->has($ouId)) {
                continue;
            }

            $override = $overrides->get($ouId);

            if ($override->inheritance === 'block') {
                return $override->value;
            }

            $default = $override->value;
        }

        return $default;
    }

    public function diff(?OrganizationalUnit $unit): Collection
    {
        $trail = $this->buildTrail($unit);

        if ($trail->isEmpty()) {
            return collect();
        }

        $overrides = ConfigOverride::query()
            ->whereIn('ou_id', $trail)
            ->orderBy('ou_id')
            ->get()
            ->groupBy('key');

        return $overrides->map(function (Collection $configs) use ($trail) {
            $sorted = $configs->sortBy(fn (ConfigOverride $override) => array_search($override->ou_id, $trail->all(), true));

            $base = $sorted->first();

            return collect([
                'keys' => $sorted->map(fn (ConfigOverride $override) => [
                    'ou_id' => $override->ou_id,
                    'inheritance' => $override->inheritance,
                    'value' => $override->value,
                ])->values(),
                'root_value' => $base?->value,
            ]);
        });
    }

    protected function buildTrail(?OrganizationalUnit $unit): Collection
    {
        if (! $unit) {
            return collect();
        }

        $path = trim((string) $unit->path, '/');

        if ($path === '') {
            return collect([$unit->getKey()]);
        }

        $ids = collect(explode('/', $path))->map(fn ($segment) => (int) $segment);

        return $ids->reverse()->values();
    }
}
