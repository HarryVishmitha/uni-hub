<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

/**
 * @mixin IdeHelperSectionMeeting
 */
class SectionMeeting extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'section_id',
        'day_of_week',
        'start_time',
        'end_time',
        'room_id',
        'modality',
        'repeat_rule',
    ];

    protected $casts = [
        'repeat_rule' => 'array',
        'start_time' => 'datetime:H:i:s',
        'end_time' => 'datetime:H:i:s',
    ];

    protected static $logAttributes = [
        'section_id',
        'day_of_week',
        'start_time',
        'end_time',
        'room_id',
        'modality',
        'repeat_rule',
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
                $day = self::dayLabel($this->day_of_week);
                $start = $this->start_time?->format('H:i');
                $end = $this->end_time?->format('H:i');
                $room = $this->room?->name ?? $this->room?->room_no ?? 'Online';

                return match ($eventName) {
                    'created' => "Meeting added {$day} {$start}-{$end} @ {$room}",
                    'updated' => "Meeting updated {$day} {$start}-{$end} @ {$room}",
                    'deleted' => "Meeting removed {$day} {$start}-{$end} @ {$room}",
                    default => "Meeting {$eventName} {$day} {$start}-{$end} @ {$room}",
                };
            });
    }

    public static function dayLabel(?int $dayOfWeek): string
    {
        if ($dayOfWeek === null) {
            return 'Day';
        }

        $map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return $map[$dayOfWeek] ?? 'Day';
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
