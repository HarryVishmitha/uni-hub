<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Branch extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;
    use LogsActivity;

    protected $fillable = [
        'university_id',
        'name',
        'code',
        'country',
        'city',
        'timezone',
        'theme_tokens',
        'feature_flags',
        'is_active',
    ];

    protected $casts = [
        'theme_tokens' => 'array',
        'feature_flags' => 'array',
        'is_active' => 'boolean',
    ];

    protected static $logAttributes = [
        'university_id',
        'name',
        'code',
        'country',
        'city',
        'timezone',
        'theme_tokens',
        'feature_flags',
        'is_active',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'branch';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function orgUnits()
    {
        return $this->hasMany(OrgUnit::class);
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function curricula()
    {
        return $this->hasMany(Curriculum::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
