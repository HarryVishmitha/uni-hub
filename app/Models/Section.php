<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperSection
 */
class Section extends Model
{
    public const STATUSES = ['planned', 'active', 'closed', 'cancelled'];

    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'course_id',
        'term_id',
        'section_code',
        'capacity',
        'waitlist_cap',
        'status',
        'notes',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'waitlist_cap' => 'integer',
    ];

    protected $appends = ['branch_id'];

    protected static $logAttributes = [
        'course_id',
        'term_id',
        'section_code',
        'capacity',
        'waitlist_cap',
        'status',
        'notes',
    ];

    protected static $logName = 'timetable';

    protected static $logOnlyDirty = true;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName)
            ->setDescriptionForEvent(function (string $eventName) {
                $courseCode = $this->course?->code ?? 'Unknown Course';
                $termCode = $this->term?->code ?? 'Unknown Term';
                $sectionLabel = $this->section_code ? "{$courseCode}-{$this->section_code}" : $courseCode;

                return match ($eventName) {
                    'created' => "Section created ({$sectionLabel}, {$termCode})",
                    'updated' => "Section updated ({$sectionLabel}, {$termCode})",
                    'deleted' => "Section deleted ({$sectionLabel}, {$termCode})",
                    default => "Section {$eventName} ({$sectionLabel}, {$termCode})",
                };
            });
    }

    public function getBranchIdAttribute(): ?int
    {
        return $this->course?->orgUnit?->branch_id;
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(SectionMeeting::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function lecturers(): HasMany
    {
        return $this->appointments()->where('role', 'lecturer');
    }

    public function teachingAssistants(): HasMany
    {
        return $this->appointments()->where('role', 'ta');
    }
}
