<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Course extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'department_id',
        'owner_ou_id',
        'delivery_ou_id',
        'ou_context_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (Course $course) {
            if (! $course->external_id) {
                $course->external_id = (string) Str::uuid();
            }
        });
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function ownerUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'owner_ou_id');
    }

    public function deliveryUnit()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'delivery_ou_id');
    }

    public function ouContext()
    {
        return $this->belongsTo(OrganizationalUnit::class, 'ou_context_id');
    }
}
