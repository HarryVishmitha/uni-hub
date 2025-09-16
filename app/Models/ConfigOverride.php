<?php

namespace App\Models;

use App\Support\Unite\Cache\UniteCacheManager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ConfigOverride extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'ou_id',
        'key',
        'value',
        'inheritance',
        'ou_context_id',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (ConfigOverride $override) {
            if (! $override->external_id) {
                $override->external_id = (string) Str::uuid();
            }
        });

        static::saved(function (ConfigOverride $override) {
            UniteCacheManager::bumpVersion();
        });

        static::deleted(function (ConfigOverride $override) {
            UniteCacheManager::bumpVersion();
        });

        static::restored(function (ConfigOverride $override) {
            UniteCacheManager::bumpVersion();
        });
    }

    public function organizationalUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_id');
    }
}
