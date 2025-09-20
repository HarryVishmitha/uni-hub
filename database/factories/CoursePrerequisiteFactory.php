<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CoursePrerequisite;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\CoursePrerequisite>
 */
class CoursePrerequisiteFactory extends Factory
{
    protected $model = CoursePrerequisite::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'prereq_course_id' => Course::factory(),
            'min_grade' => $this->faker->optional()->randomElement(['A', 'B', 'C', '70%', '75%']),
        ];
    }
}
