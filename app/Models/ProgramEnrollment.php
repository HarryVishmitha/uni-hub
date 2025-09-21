<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperProgramEnrollment
 */
class ProgramEnrollment extends Model
{
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_PAUSED = 'paused';
    public const STATUS_GRADUATED = 'graduated';
    public const STATUS_WITHDRAWN = 'withdrawn';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_PAUSED,
        self::STATUS_GRADUATED,
        self::STATUS_WITHDRAWN,
    ];

    protected $fillable = [
        'student_id',
        'program_id',
        'status',
        'cohort',
        'start_term_id',
    ];

    protected $casts = [
        'start_term_id' => 'integer',
    ];

    protected $appends = ['branch_id'];

    protected static $logName = 'enrollment';

    protected static $logAttributes = [
        'student_id',
        'program_id',
        'status',
        'cohort',
        'start_term_id',
    ];

    protected static $logOnlyDirty = true;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName)
            ->setDescriptionForEvent(fn (string $eventName) => "program_enrollment.{$eventName}");
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function startTerm(): BelongsTo
    {
        return $this->belongsTo(Term::class, 'start_term_id');
    }

    public function getBranchIdAttribute(): ?int
    {
        return $this->program?->branch_id;
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }
}
