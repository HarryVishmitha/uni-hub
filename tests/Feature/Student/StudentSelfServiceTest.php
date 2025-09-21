<?php

namespace Tests\Feature\Student;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class StudentSelfServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_student_view_only_their_courses(): void
    {
        $branch = Branch::factory()->create();
        $term = Term::factory()->create([
            'branch_id' => $branch->id,
            'add_drop_start' => now()->subWeek(),
            'add_drop_end' => now()->addWeek(),
        ]);
        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create(['course_id' => $course->id, 'term_id' => $term->id]);

        $student = User::factory()->create(['branch_id' => $branch->id]);
        $student->assignRole('student');

        $otherStudent = User::factory()->create(['branch_id' => $branch->id]);
        $otherStudent->assignRole('student');

        SectionEnrollment::factory()->create([
            'section_id' => $section->id,
            'student_id' => $student->id,
            'status' => SectionEnrollment::STATUS_ACTIVE,
        ]);

        SectionEnrollment::factory()->create([
            'section_id' => $section->id,
            'student_id' => $otherStudent->id,
            'status' => SectionEnrollment::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($student)
            ->get(route('account.courses.index'));

        $response->assertOk();

        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('Account/Courses/Index')
                ->has('enrollments', 1)
        );
    }

    public function test_student_timetable_endpoint_returns_schedule(): void
    {
        $branch = Branch::factory()->create(['timezone' => 'UTC']);
        $term = Term::factory()->create([
            'branch_id' => $branch->id,
            'add_drop_start' => now()->subWeek(),
            'add_drop_end' => now()->addWeek(),
        ]);
        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create(['course_id' => $course->id, 'term_id' => $term->id]);

        $student = User::factory()->create(['branch_id' => $branch->id]);
        $student->assignRole('student');

        SectionEnrollment::factory()->create([
            'section_id' => $section->id,
            'student_id' => $student->id,
            'status' => SectionEnrollment::STATUS_ACTIVE,
        ]);

        $response = $this->actingAs($student)
            ->get(route('account.timetable.index'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) =>
            $page->component('Account/Timetable/Index')
                ->has('schedule')
                ->has('upcoming')
        );
    }
}
