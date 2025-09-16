<?php

namespace App\Models;

use App\Support\Unite\Cache\UniteCacheManager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OuPresence extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'ou_presences';

    protected $fillable = [
        'ou_id',
        'branch_ou_id',
        'capabilities',
        'active_from',
        'active_to',
        'ou_context_id',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'active_from' => 'datetime',
        'active_to' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (OuPresence $presence) {
            if (! $presence->external_id) {
                $presence->external_id = (string) Str::uuid();
            }
        });

        static::saved(function (OuPresence $presence) {
            UniteCacheManager::bumpVersion();
        });

        static::deleted(function (OuPresence $presence) {
            UniteCacheManager::bumpVersion();
        });

        static::restored(function (OuPresence $presence) {
            UniteCacheManager::bumpVersion();
        });
    }

    public function organizationalUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_id');
    }

    public function branch()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'branch_ou_id');
    }
}
