<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Term extends Model
{
    public const STATUSES = ['planned', 'active', 'closed'];

    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected $fillable = [
        'branch_id',
        'title',
        'start_date',
        'end_date',
        'add_drop_start',
        'add_drop_end',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'add_drop_start' => 'date',
        'add_drop_end' => 'date',
    ];

    protected static $logAttributes = [
        'branch_id',
        'title',
        'start_date',
        'end_date',
        'add_drop_start',
        'add_drop_end',
        'status',
    ];

    protected static $logOnlyDirty = true;

    protected static $logName = 'term';

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(static::$logAttributes)
            ->logOnlyDirty()
            ->useLogName(static::$logName);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
