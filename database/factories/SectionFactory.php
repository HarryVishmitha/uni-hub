<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Section;
use App\Models\Term;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Section>
 */
class SectionFactory extends Factory
{
    protected $model = Section::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'term_id' => Term::factory(),
            'section_code' => strtoupper(fake()->bothify('??#')),
            'capacity' => fake()->numberBetween(25, 120),
            'waitlist_cap' => fake()->numberBetween(0, 25),
            'status' => fake()->randomElement(Section::STATUSES),
            'notes' => fake()->optional()->paragraph(),
        ];
    }
}
