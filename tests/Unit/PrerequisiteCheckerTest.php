<?php

namespace Tests\Unit;

use App\Models\Course;
use App\Models\CoursePrerequisite;
use App\Models\OrgUnit;
use App\Models\Term;
use App\Models\Transcript;
use App\Models\User;
use App\Services\Enrollment\PrerequisiteChecker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrerequisiteCheckerTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_missing_prerequisites(): void
    {
        $this->seed();

        $orgUnit = OrgUnit::factory()->create();
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $prereq = Course::factory()->create(['org_unit_id' => $orgUnit->id]);

        CoursePrerequisite::create([
            'course_id' => $course->id,
            'prereq_course_id' => $prereq->id,
        ]);

        $student = User::factory()->create(['branch_id' => $orgUnit->branch_id]);
        $student->assignRole('student');

        $checker = app(PrerequisiteChecker::class);
        $missing = $checker->missing($student, $course);

        $this->assertNotEmpty($missing);
        $this->assertSame($prereq->id, $missing[0]['course_id']);
    }

    public function test_satisfied_prerequisites_return_empty_array(): void
    {
        $this->seed();

        $orgUnit = OrgUnit::factory()->create();
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $prereq = Course::factory()->create(['org_unit_id' => $orgUnit->id]);

        CoursePrerequisite::create([
            'course_id' => $course->id,
            'prereq_course_id' => $prereq->id,
            'min_grade' => 'C',
        ]);

        $student = User::factory()->create(['branch_id' => $orgUnit->branch_id]);
        $student->assignRole('student');

        $term = Term::factory()->create(['branch_id' => $orgUnit->branch_id]);

        Transcript::factory()->create([
            'student_id' => $student->id,
            'course_id' => $prereq->id,
            'term_id' => $term->id,
            'final_grade' => 'A',
            'grade_points' => 4.0,
        ]);

        $checker = app(PrerequisiteChecker::class);
        $missing = $checker->missing($student, $course);

        $this->assertEmpty($missing);
    }
}
