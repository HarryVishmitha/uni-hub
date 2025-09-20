<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperOrgUnit
 */
class OrgUnit extends Model
{
    public const TYPES = ['faculty', 'school', 'division', 'department'];

    use HasFactory;
    use SoftDeletes;
    use Blameable;
    use LogsActivity;

    protected $fillable = [
        'branch_id',
        'parent_id',
        'name',
        'code',
        'type',
    ];

    protected static $logAttributes = [
        'branch_id',
        'parent_id',
        'name',
        'code',
        'type',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'org_unit';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
