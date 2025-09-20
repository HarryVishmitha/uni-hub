<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Course extends Model
{
    public const STATUSES = ['draft', 'active', 'archived'];

    public const DELIVERY_MODES = ['onsite', 'online', 'hybrid'];

    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'org_unit_id',
        'code',
        'title',
        'credit_hours',
        'delivery_mode',
        'status',
    ];

    protected static $logAttributes = [
        'org_unit_id',
        'code',
        'title',
        'credit_hours',
        'delivery_mode',
        'status',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'course';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function orgUnit(): BelongsTo
    {
        return $this->belongsTo(OrgUnit::class);
    }

    public function outcomes(): HasMany
    {
        return $this->hasMany(CourseOutcome::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function prerequisites(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'course_prerequisites',
            'course_id',
            'prereq_course_id'
        )->using(CoursePrerequisite::class)->withPivot('min_grade')->withTimestamps();
    }

    public function dependentCourses(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'course_prerequisites',
            'prereq_course_id',
            'course_id'
        )->using(CoursePrerequisite::class)->withPivot('min_grade')->withTimestamps();
    }

    public function getBranchIdAttribute(): ?int
    {
        return $this->orgUnit?->branch_id;
    }
}
