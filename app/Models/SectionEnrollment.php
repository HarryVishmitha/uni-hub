<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperSectionEnrollment
 */
class SectionEnrollment extends Model
{
    use HasFactory;
    use LogsActivity;

    public const ROLE_STUDENT = 'student';
    public const ROLE_AUDITOR = 'auditor';

    public const ROLES = [
        self::ROLE_STUDENT,
        self::ROLE_AUDITOR,
    ];

    public const STATUS_ACTIVE = 'active';
    public const STATUS_WAITLISTED = 'waitlisted';
    public const STATUS_DROPPED = 'dropped';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_WAITLISTED,
        self::STATUS_DROPPED,
        self::STATUS_COMPLETED,
        self::STATUS_FAILED,
    ];

    protected $fillable = [
        'student_id',
        'section_id',
        'role',
        'status',
        'enrolled_at',
        'waitlisted_at',
        'dropped_at',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'waitlisted_at' => 'datetime',
        'dropped_at' => 'datetime',
    ];

    protected $appends = ['branch_id'];

    protected static $logName = 'enrollment';

    protected static $logAttributes = [
        'student_id',
        'section_id',
        'role',
        'status',
        'enrolled_at',
        'waitlisted_at',
        'dropped_at',
    ];

    protected static $logOnlyDirty = true;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName)
            ->setDescriptionForEvent(fn (string $eventName) => "section_enrollment.{$eventName}");
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function getBranchIdAttribute(): ?int
    {
        return $this->section?->branch_id;
    }

    public function markEnrolled(?Carbon $timestamp = null): void
    {
        $this->status = self::STATUS_ACTIVE;
        $this->enrolled_at = $timestamp ?? now();
        $this->waitlisted_at = null;
        $this->save();
    }

    public function markWaitlisted(?Carbon $timestamp = null): void
    {
        $this->status = self::STATUS_WAITLISTED;
        $this->waitlisted_at = $timestamp ?? now();
        $this->enrolled_at = null;
        $this->save();
    }

    public function markDropped(?Carbon $timestamp = null): void
    {
        $this->status = self::STATUS_DROPPED;
        $this->dropped_at = $timestamp ?? now();
        $this->save();
    }
}
