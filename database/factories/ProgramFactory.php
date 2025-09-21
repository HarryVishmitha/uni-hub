<?php

namespace Database\Factories;

use App\Models\OrgUnit;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Program>
 */
class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        return [
            'branch_id' => null,
            'org_unit_id' => OrgUnit::factory(),
            'title' => fake()->unique()->sentence(3),
            'description' => fake()->paragraph(),
            'level' => fake()->randomElement(['Undergraduate', 'Graduate', 'Certificate']),
            'modality' => fake()->randomElement(['onsite', 'online', 'hybrid']),
            'duration_months' => fake()->numberBetween(12, 48),
            'status' => fake()->randomElement(['draft', 'active']),
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Program $program) {
            $orgUnit = $program->orgUnit ?? OrgUnit::factory()->create();
            $program->orgUnit()->associate($orgUnit);
            $program->branch_id = $orgUnit->branch_id;
        });
    }
}
