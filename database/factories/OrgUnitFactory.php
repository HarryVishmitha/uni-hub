<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\OrgUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\OrgUnit>
 */
class OrgUnitFactory extends Factory
{
    protected $model = OrgUnit::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(OrgUnit::TYPES);

        return [
            'branch_id' => Branch::factory(),
            'parent_id' => null,
            'name' => match ($type) {
                'faculty' => $this->faker->randomElement(['Faculty of Science', 'Faculty of Business', 'Faculty of Engineering']),
                'school' => $this->faker->randomElement(['School of Computing', 'School of Arts', 'School of Medicine']),
                'division' => $this->faker->randomElement(['Division of Mathematics', 'Division of Finance', 'Division of Humanities']),
                default => $this->faker->randomElement(['Department of Computer Science', 'Department of Physics', 'Department of Marketing']),
            },
            'code' => strtoupper($this->faker->unique()->lexify('????')),
            'type' => $type,
        ];
    }

    public function forBranch(Branch $branch): self
    {
        return $this->state(fn () => ['branch_id' => $branch->id]);
    }
}
