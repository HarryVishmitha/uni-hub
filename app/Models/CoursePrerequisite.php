<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CoursePrerequisite extends Pivot
{
    use HasFactory;
    use LogsActivity;

    protected $table = 'course_prerequisites';

    protected $fillable = [
        'course_id',
        'prereq_course_id',
        'min_grade',
    ];

    public $timestamps = true;

    protected static $logAttributes = [
        'course_id',
        'prereq_course_id',
        'min_grade',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'course_prerequisite';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function prerequisite(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'prereq_course_id');
    }
}
