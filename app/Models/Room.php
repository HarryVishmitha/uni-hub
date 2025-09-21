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
 * @mixin IdeHelperRoom
 */
class Room extends Model
{
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'branch_id',
        'building',
        'room_no',
        'name',
        'seats',
        'equipment',
        'is_active',
    ];

    protected $casts = [
        'equipment' => 'array',
        'is_active' => 'boolean',
    ];

    protected static $logAttributes = [
        'branch_id',
        'building',
        'room_no',
        'name',
        'seats',
        'equipment',
        'is_active',
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
                $label = $this->name ?: "{$this->building}-{$this->room_no}";

                return match ($eventName) {
                    'created' => "Room created ({$label})",
                    'updated' => "Room updated ({$label})",
                    'deleted' => "Room deleted ({$label})",
                    default => "Room {$eventName} ({$label})",
                };
            });
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(SectionMeeting::class);
    }
}
