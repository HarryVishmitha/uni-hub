<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\School;

/**
 * @mixin IdeHelperDepartment
 */
class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'school_id',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}