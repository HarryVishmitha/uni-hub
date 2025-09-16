<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Enrollment extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'user_id',
        'ou_id',
        'ou_context_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (Enrollment $enrollment) {
            if (! $enrollment->external_id) {
                $enrollment->external_id = (string) Str::uuid();
            }
        });
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function organizationalUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_id');
    }

    public function ouContext()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_context_id');
    }
}
