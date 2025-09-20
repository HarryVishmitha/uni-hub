<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseOutcome;
use Illuminate\Database\Seeder;

class CourseOutcomeSeeder extends Seeder
{
    public function run(): void
    {
        if (CourseOutcome::query()->exists()) {
            return;
        }

        Course::query()->each(function (Course $course) {
            CourseOutcome::factory()
                ->count(3)
                ->state(['course_id' => $course->id])
                ->sequence(
                    ['outcome_code' => $course->code.'-LO1'],
                    ['outcome_code' => $course->code.'-LO2'],
                    ['outcome_code' => $course->code.'-LO3']
                )
                ->create();
        });
    }
}
