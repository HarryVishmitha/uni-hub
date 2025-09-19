<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Curriculum extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;

    protected $fillable = [
        'branch_id',
        'program_id',
        'version',
        'status',
        'effective_from',
        'min_credits',
        'notes',
    ];

    protected $casts = [
        'effective_from' => 'date',
        'min_credits' => 'integer',
        'notes' => 'array',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function requirements()
    {
        return $this->hasMany(CurriculumRequirement::class);
    }
}
