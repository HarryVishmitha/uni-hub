<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperCourseOutcome
 */
class CourseOutcome extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'course_id',
        'outcome_code',
        'description',
    ];

    protected static $logAttributes = [
        'course_id',
        'outcome_code',
        'description',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'course_outcome';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
