<?php

namespace App\Support\Rbac;

use Spatie\Permission\PermissionRegistrar;

class RbacCache
{
    public static function clearCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public static function clearOnModelEvents(): void
    {
        $models = [
            \Spatie\Permission\Models\Role::class,
            \Spatie\Permission\Models\Permission::class,
        ];

        foreach ($models as $model) {
            $model::created(fn() => static::clearCache());
            $model::updated(fn() => static::clearCache());
            $model::deleted(fn() => static::clearCache());
        }
    }
}