<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperTranscript
 */
class Transcript extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'course_id',
        'term_id',
        'final_grade',
        'grade_points',
        'published_at',
    ];

    protected $casts = [
        'grade_points' => 'decimal:2',
        'published_at' => 'datetime',
    ];

    protected $appends = ['branch_id'];

    protected static $logName = 'enrollment';

    protected static $logAttributes = [
        'student_id',
        'course_id',
        'term_id',
        'final_grade',
        'grade_points',
        'published_at',
    ];

    protected static $logOnlyDirty = true;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName)
            ->setDescriptionForEvent(fn (string $eventName) => "transcript.{$eventName}");
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function getBranchIdAttribute(): ?int
    {
        return $this->course?->branch_id;
    }
}
