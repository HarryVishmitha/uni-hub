<?php

namespace App\Support\Unite\Cache;

use Illuminate\Support\Facades\Cache;

class UniteCacheManager
{
    public static function versionKey(): string
    {
        return config('unite.cache.version_key', 'unite_cache_version');
    }

    public static function prefix(): string
    {
        return config('unite.cache.prefix', 'unite');
    }

    public static function ttl(): int
    {
        return (int) config('unite.cache.ttl', 3600);
    }

    public static function version(): int
    {
        return Cache::rememberForever(static::versionKey(), fn () => 1);
    }

    public static function bumpVersion(): int
    {
        $key = static::versionKey();

        if (! Cache::has($key)) {
            Cache::forever($key, 1);

            return 1;
        }

        return Cache::increment($key) ?: static::version();
    }

    public static function key(string $suffix): string
    {
        return static::prefix() . ':' . static::version() . ':' . $suffix;
    }

    public static function forget(string $suffix): void
    {
        Cache::forget(static::key($suffix));
    }
}
