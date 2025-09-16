<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Contracts\Unite\OuAccessResolver;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

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

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function activeAppointments(?Carbon $at = null)
    {
        return $this->appointments()->active($at);
    }

    public function canForOu(string $permission, OrganizationalUnit|int|null $organizationalUnit = null): bool
    {
        /** @var OuAccessResolver $resolver */
        $resolver = app(OuAccessResolver::class);

        return $resolver->allows($this, $permission, $organizationalUnit);
    }

    public function scopedUnitData(): Collection
    {
        /** @var OuAccessResolver $resolver */
        $resolver = app(OuAccessResolver::class);

        return $resolver->effectiveUnits($this);
    }

    public function scopedUnitIds(): Collection
    {
        return $this->scopedUnitData()->get('unit_ids', collect());
    }
}
