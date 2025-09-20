<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class University extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;
    use LogsActivity;

    protected $fillable = [
        'name',
        'code',
        'domain',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected static $logAttributes = [
        'name',
        'code',
        'domain',
        'is_active',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'university';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }
}
