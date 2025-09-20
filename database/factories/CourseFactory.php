<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\OrgUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        return [
            'org_unit_id' => OrgUnit::factory(),
            'code' => strtoupper($this->faker->unique()->lexify('???')).$this->faker->numberBetween(100, 499),
            'title' => $this->faker->unique()->catchPhrase().' Course',
            'credit_hours' => $this->faker->numberBetween(1, 6),
            'delivery_mode' => $this->faker->randomElement(Course::DELIVERY_MODES),
            'status' => $this->faker->randomElement(Course::STATUSES),
        ];
    }

    public function active(): self
    {
        return $this->state(fn () => ['status' => 'active']);
    }
}
