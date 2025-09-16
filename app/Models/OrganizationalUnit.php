<?php

namespace App\Models;

use App\Support\Unite\Cache\UniteCacheManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collections\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OrganizationalUnit extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'type',
        'name',
        'code',
        'parent_id',
        'status',
        'metadata',
        'ou_context_id',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (OrganizationalUnit $unit) {
            if (! $unit->external_id) {
                $unit->external_id = (string) Str::uuid();
            }
        });

        static::saving(function (OrganizationalUnit $unit) {
            if ($unit->parent_id && $unit->parent_id === $unit->id) {
                throw new \InvalidArgumentException('Organizational Unit cannot be its own parent.');
            }
        });

        static::created(function (OrganizationalUnit $unit) {
            $unit->syncPath();
            UniteCacheManager::bumpVersion();
        });

        static::updated(function (OrganizationalUnit $unit) {
            if ($unit->wasChanged('parent_id')) {
                $unit->syncPath(true);
            }

            if ($unit->wasChanged(['parent_id', 'status', 'code'])) {
                UniteCacheManager::bumpVersion();
            }
        });

        static::deleted(function (OrganizationalUnit $unit) {
            UniteCacheManager::bumpVersion();
        });

        static::restored(function (OrganizationalUnit $unit) {
            UniteCacheManager::bumpVersion();
        });

        static::deleting(function (OrganizationalUnit $unit) {
            if ($unit->children()->exists() && $unit->status !== 'inactive') {
                throw new \RuntimeException('Deactivate or reassign children before deleting an organizational unit.');
            }
        });
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function presences()
    {
        return $this->hasMany(OuPresence::class, 'ou_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'ou_id');
    }

    public function configOverrides()
    {
        return $this->hasMany(ConfigOverride::class, 'ou_id');
    }

    public function scopeDescendantsOf(Builder $query, self $unit): Builder
    {
        if (! $unit->path) {
            return $query->whereRaw('1 = 0');
        }

        $path = rtrim($unit->path, '/') . '/';

        return $query->where('path', 'like', $path . '%');
    }

    /**
     * Return a collection of descendant unit IDs.
     */
    public function descendantIds(bool $includeSelf = false): Collection
    {
        if (! $this->path) {
            return collect();
        }

        return static::query()
            ->where(function (Builder $query) use ($includeSelf) {
                $query->where('path', 'like', rtrim($this->path, '/') . '/%');

                if ($includeSelf) {
                    $query->orWhere('id', $this->id);
                }
            })
            ->pluck('id');
    }

    public function syncPath(bool $withDescendants = false): void
    {
        $path = $this->parent
            ? rtrim((string) $this->parent->path, '/') . '/' . $this->id
            : '/' . $this->id;

        if ($this->path !== $path) {
            $this->forceFill(['path' => $path])->saveQuietly();
        }

        if ($withDescendants) {
            $this->children
                ->each(fn (OrganizationalUnit $child) => $child->syncPath(true));
        }
    }
}
