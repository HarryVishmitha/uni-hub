<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperAppointment
 */
class Appointment extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'section_id',
        'user_id',
        'role',
        'load_percent',
        'assigned_at',
    ];

    protected $casts = [
        'load_percent' => 'integer',
        'assigned_at' => 'datetime',
    ];

    protected static $logAttributes = [
        'section_id',
        'user_id',
        'role',
        'load_percent',
        'assigned_at',
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
                $userName = $this->user?->name ?? 'Unknown Instructor';
                $roleLabel = ucfirst($this->role ?? 'assignment');
                $load = $this->load_percent ? $this->load_percent.'%' : '0%';

                return match ($eventName) {
                    'created' => "Assigned {$roleLabel}: {$userName} ({$load})",
                    'updated' => "Updated {$roleLabel}: {$userName} ({$load})",
                    'deleted' => "Removed {$roleLabel}: {$userName}",
                    default => "Appointment {$eventName}: {$roleLabel} {$userName} ({$load})",
                };
            });
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
