<?php

namespace Database\Factories;

use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    public function definition(): array
    {
        $role = fake()->randomElement(['lecturer', 'ta']);

        return [
            'section_id' => Section::factory(),
            'user_id' => User::factory(),
            'role' => $role,
            'load_percent' => $role === 'lecturer' ? fake()->numberBetween(40, 70) : fake()->numberBetween(10, 40),
            'assigned_at' => now()->subDays(fake()->numberBetween(0, 30)),
        ];
    }
}
