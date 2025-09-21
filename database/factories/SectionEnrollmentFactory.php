<?php

namespace Database\Factories;

use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\SectionEnrollment>
 */
class SectionEnrollmentFactory extends Factory
{
    protected $model = SectionEnrollment::class;

    public function definition(): array
    {
        return [
            'section_id' => Section::factory(),
            'student_id' => User::factory(),
            'role' => fake()->randomElement(SectionEnrollment::ROLES),
            'status' => SectionEnrollment::STATUS_ACTIVE,
            'enrolled_at' => now(),
            'waitlisted_at' => null,
            'dropped_at' => null,
        ];
    }

    public function waitlisted(): static
    {
        return $this->state(fn () => [
            'status' => SectionEnrollment::STATUS_WAITLISTED,
            'enrolled_at' => null,
            'waitlisted_at' => now(),
        ]);
    }

    public function configure(): static
    {
        return $this->afterMaking(function (SectionEnrollment $enrollment) {
            $section = $enrollment->section ?? Section::factory()->create();
            $enrollment->section()->associate($section);

            $student = $enrollment->student ?? User::factory()->create(['branch_id' => $section->branch_id]);
            if ($section->branch_id && $student->branch_id !== $section->branch_id) {
                $student->branch_id = $section->branch_id;
                $student->saveQuietly();
            }

            if (! $student->hasRole('student')) {
                $student->assignRole('student');
            }

            $enrollment->student()->associate($student);
        });
    }
}
