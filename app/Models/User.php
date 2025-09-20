<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Route;

/**
 * @mixin IdeHelperUser
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'branch_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super_admin');
    }

    public function preferredDashboardRoute(): string
    {
        $map = [
            'super_admin' => 'admin.dashboard',
            'admin' => 'admin.dashboard',
            'branch_admin' => 'admin.dashboard',
            'front_office' => 'front_office.dashboard',
            'lecturer' => 'lecturer.dashboard',
            'lab_manager' => 'lab_manager.dashboard',
            'student' => 'student.dashboard',
        ];

        foreach ($map as $role => $routeName) {
            if ($this->hasRole($role) && Route::has($routeName)) {
                return $routeName;
            }
        }

        return Route::has('dashboard') ? 'dashboard' : '/';
    }
}
