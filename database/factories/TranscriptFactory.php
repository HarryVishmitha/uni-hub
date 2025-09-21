<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Term;
use App\Models\Transcript;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Transcript>
 */
class TranscriptFactory extends Factory
{
    protected $model = Transcript::class;

    public function definition(): array
    {
        return [
            'student_id' => User::factory(),
            'course_id' => Course::factory(),
            'term_id' => Term::factory(),
            'final_grade' => fake()->randomElement(['A', 'B', 'C', 'D', 'F', 'P']),
            'grade_points' => fake()->randomFloat(2, 0, 4),
            'published_at' => now(),
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (Transcript $transcript) {
            $course = $transcript->course ?? Course::factory()->create();
            $term = $transcript->term ?? Term::factory()->create(['branch_id' => $course->branch_id]);
            $student = $transcript->student ?? User::factory()->create(['branch_id' => $course->branch_id]);

            if (! $student->hasRole('student')) {
                $student->assignRole('student');
            }

            if ($student->branch_id !== $course->branch_id) {
                $student->branch_id = $course->branch_id;
                $student->saveQuietly();
            }

            $transcript->course()->associate($course);
            $transcript->term()->associate($term);
            $transcript->student()->associate($student);
        });
    }
}
