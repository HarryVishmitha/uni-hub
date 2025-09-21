<?php

namespace Database\Factories;

use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\ProgramEnrollment>
 */
class ProgramEnrollmentFactory extends Factory
{
    protected $model = ProgramEnrollment::class;

    public function definition(): array
    {
        return [
            'program_id' => Program::factory(),
            'student_id' => User::factory(),
            'status' => fake()->randomElement(ProgramEnrollment::STATUSES),
            'cohort' => fake()->optional()->regexify('[A-Z]{2}-20[2-9][0-9] Cohort'),
            'start_term_id' => null,
        ];
    }

    public function configure(): static
    {
        return $this->afterMaking(function (ProgramEnrollment $enrollment) {
            $program = $enrollment->program ?? Program::factory()->create();
            $enrollment->program()->associate($program);

            $student = $enrollment->student ?? User::factory()->create(['branch_id' => $program->branch_id]);
            if (! $student->branch_id) {
                $student->branch_id = $program->branch_id;
            }
            $student->saveQuietly();
            $enrollment->student()->associate($student);

            if (! $enrollment->start_term_id && fake()->boolean()) {
                $term = Term::where('branch_id', $program->branch_id)->inRandomOrder()->first();
                if (! $term) {
                    $term = Term::factory()->create(['branch_id' => $program->branch_id]);
                }

                $enrollment->startTerm()->associate($term);
            }
        })->afterCreating(function (ProgramEnrollment $enrollment) {
            $student = $enrollment->student;
            $program = $enrollment->program;

            if ($student && ! $student->branch_id && $program) {
                $student->updateQuietly(['branch_id' => $program->branch_id]);
            }

            if ($student && ! $student->hasRole('student')) {
                $student->assignRole('student');
            }
        });
    }
}
