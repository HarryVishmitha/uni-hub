<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Room>
 */
class RoomFactory extends Factory
{
    public function definition(): array
    {
        $buildings = ['Main Hall', 'Science Center', 'Engineering Block', 'Library Wing', 'Innovation Hub'];
        $equipmentPool = ['Projector', 'Whiteboard', 'Sound System', 'Lab PCs', 'Video Conferencing'];

        return [
            'branch_id' => Branch::factory(),
            'building' => fake()->randomElement($buildings),
            'room_no' => strtoupper(fake()->bothify('###')),
            'name' => fake()->optional()->words(2, true),
            'seats' => fake()->numberBetween(20, 140),
            'equipment' => fake()->randomElements($equipmentPool, fake()->numberBetween(1, 3)),
            'is_active' => fake()->boolean(90),
        ];
    }
}
