<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseOutcome;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\CourseOutcome>
 */
class CourseOutcomeFactory extends Factory
{
    protected $model = CourseOutcome::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'outcome_code' => strtoupper($this->faker->unique()->lexify('OC??')),
            'description' => $this->faker->sentence(12),
        ];
    }
}
