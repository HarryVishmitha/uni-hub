<?php

namespace App\Models;

use App\Models\Concerns\Blameable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @mixin IdeHelperCurriculumRequirement
 */
class CurriculumRequirement extends Model
{
    use HasFactory;
    use SoftDeletes;
    use Blameable;

    protected $fillable = [
        'branch_id',
        'curriculum_id',
        'code',
        'title',
        'requirement_type',
        'credit_value',
        'rules',
        'is_required',
    ];

    protected $casts = [
        'credit_value' => 'integer',
        'rules' => 'array',
        'is_required' => 'boolean',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class);
    }
}
