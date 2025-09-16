<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Department extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'school_id',
        'ou_id',
        'ou_context_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (Department $department) {
            if (! $department->external_id) {
                $department->external_id = (string) Str::uuid();
            }
        });
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
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
