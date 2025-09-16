<?php

namespace App\Models;

use App\Enums\ScopeMode;
use App\Support\Unite\Cache\EffectiveScopeCache;
use App\Support\Unite\Cache\UniteCacheManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class Appointment extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'ou_id',
        'role_id',
        'scope_mode',
        'is_primary',
        'start_at',
        'end_at',
        'ou_context_id',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'scope_mode' => ScopeMode::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment) {
            if (! $appointment->external_id) {
                $appointment->external_id = (string) Str::uuid();
            }
        });

        static::saved(function (Appointment $appointment) {
            if ($user = $appointment->user) {
                EffectiveScopeCache::forget($user);

                if ($role = $appointment->role) {
                    if (! $user->hasRole($role->name)) {
                        $user->assignRole($role);
                    }
                }
            }

            UniteCacheManager::bumpVersion();
        });

        static::deleted(function (Appointment $appointment) {
            if ($user = $appointment->user) {
                EffectiveScopeCache::forget($user);

                if ($role = $appointment->role) {
                    $remaining = $user->appointments()
                        ->where('role_id', $role->id)
                        ->exists();

                    if (! $remaining && $user->hasRole($role->name)) {
                        $user->removeRole($role);
                    }
                }
            }

            UniteCacheManager::bumpVersion();
        });

        static::restored(function (Appointment $appointment) {
            if ($user = $appointment->user) {
                EffectiveScopeCache::forget($user);

                if ($role = $appointment->role) {
                    if (! $user->hasRole($role->name)) {
                        $user->assignRole($role);
                    }
                }
            }

            UniteCacheManager::bumpVersion();
        });
    }

    public function scopeActive(Builder $query, ?Carbon $at = null): Builder
    {
        $at ??= now();

        return $query
            ->where(function (Builder $dateQuery) use ($at) {
                $dateQuery
                    ->whereNull('start_at')
                    ->orWhere('start_at', '<=', $at);
            })
            ->where(function (Builder $dateQuery) use ($at) {
                $dateQuery
                    ->whereNull('end_at')
                    ->orWhere('end_at', '>=', $at);
            });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function organizationalUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
