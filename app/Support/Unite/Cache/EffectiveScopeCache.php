<?php

namespace App\Support\Unite\Cache;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class EffectiveScopeCache
{
    public static function remember(User $user, callable $resolver): Collection
    {
        $key = static::key($user);

        return Cache::remember($key, UniteCacheManager::ttl(), function () use ($resolver) {
            $result = $resolver();

            return $result instanceof Collection ? $result : collect($result);
        });
    }

    public static function forget(User $user): void
    {
        Cache::forget(static::key($user));
    }

    protected static function key(User $user): string
    {
        return UniteCacheManager::key('user:' . $user->getKey() . ':scoped_units');
    }
}
