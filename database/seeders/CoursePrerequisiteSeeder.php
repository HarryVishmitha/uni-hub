<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CoursePrerequisite;
use Illuminate\Database\Seeder;

class CoursePrerequisiteSeeder extends Seeder
{
    public function run(): void
    {
        if (CoursePrerequisite::query()->exists()) {
            return;
        }

        $coursesByBranch = Course::query()
            ->with('orgUnit')
            ->get()
            ->groupBy(fn (Course $course) => $course->branch_id);

        foreach ($coursesByBranch as $courses) {
            $courses = $courses->values();

            for ($i = 1; $i < $courses->count(); $i++) {
                $course = $courses[$i];
                $prereq = $courses[$i - 1];

                if ((int) $course->id === (int) $prereq->id) {
                    continue;
                }

                CoursePrerequisite::create([
                    'course_id' => $course->id,
                    'prereq_course_id' => $prereq->id,
                    'min_grade' => $this->randomGrade(),
                ]);
            }
        }
    }

    private function randomGrade(): ?string
    {
        return collect(['A', 'B', 'C', '70%', '75%', null])->random();
    }
}
