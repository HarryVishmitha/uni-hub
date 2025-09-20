<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrgUnit extends Model
{
    public const TYPES = ['faculty', 'school', 'division', 'department'];

    use HasFactory;
    use SoftDeletes;
    use Blameable;

    protected $fillable = [
        'branch_id',
        'parent_id',
        'name',
        'code',
        'type',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
