<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Program extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;
    use LogsActivity;

    protected $fillable = [
        'branch_id',
        'org_unit_id',
        'title',
        'description',
        'level',
        'modality',
        'duration_months',
        'status',
    ];

    protected $casts = [
        'duration_months' => 'integer',
    ];

    protected static $logAttributes = [
        'branch_id',
        'org_unit_id',
        'title',
        'description',
        'level',
        'modality',
        'duration_months',
        'status',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'program';

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

    public function orgUnit()
    {
        return $this->belongsTo(OrgUnit::class);
    }

    public function curricula()
    {
        return $this->hasMany(Curriculum::class);
    }
}
