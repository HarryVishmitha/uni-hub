<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Program extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;

    protected $fillable = [
        'branch_id',
        'org_unit_id',
        'title',
        'description',
        'level',
        'modality',
        'duration_months',
        'status',
    ];

    protected $casts = [
        'duration_months' => 'integer',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function orgUnit()
    {
        return $this->belongsTo(OrgUnit::class);
    }

    public function curricula()
    {
        return $this->hasMany(Curriculum::class);
    }
}
