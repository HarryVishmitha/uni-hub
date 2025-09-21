<?php

namespace Tests\Feature\Admin;

use App\Jobs\WaitlistPromoter;
use App\Models\Branch;
use App\Models\Course;
use App\Models\CoursePrerequisite;
use App\Models\OrgUnit;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\Transcript;
use App\Models\User;
use App\Services\Enrollment\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EnrollmentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_enrollment_respects_capacity_and_waitlist_rules(): void
    {
        $context = $this->createEnrollmentContext(capacity: 1, waitlistCap: 2);

        $this->actingAs($context['admin'])
            ->postJson(route('admin.sections.enroll', $context['section']), [
                'student_id' => $context['students'][0]->id,
                'role' => SectionEnrollment::ROLE_STUDENT,
            ])
            ->assertCreated()
            ->assertJsonPath('status', SectionEnrollment::STATUS_ACTIVE);

        $waitlistResponse = $this->actingAs($context['admin'])
            ->postJson(route('admin.sections.enroll', $context['section']), [
                'student_id' => $context['students'][1]->id,
                'role' => SectionEnrollment::ROLE_STUDENT,
            ]);

        $waitlistResponse->assertCreated()
            ->assertJsonPath('status', SectionEnrollment::STATUS_WAITLISTED);
    }

    public function test_waitlisted_students_promote_when_seat_opens(): void
    {
        Queue::fake();

        $context = $this->createEnrollmentContext(capacity: 1, waitlistCap: 2);

        $this->actingAs($context['admin'])->postJson(route('admin.sections.enroll', $context['section']), [
            'student_id' => $context['students'][0]->id,
            'role' => SectionEnrollment::ROLE_STUDENT,
        ])->assertCreated();

        $this->actingAs($context['admin'])->postJson(route('admin.sections.enroll', $context['section']), [
            'student_id' => $context['students'][1]->id,
            'role' => SectionEnrollment::ROLE_STUDENT,
        ])->assertCreated();

        $waitlisted = SectionEnrollment::where('student_id', $context['students'][1]->id)->firstOrFail();
        $active = SectionEnrollment::where('student_id', $context['students'][0]->id)->firstOrFail();

        $this->actingAs($context['admin'])
            ->delete(route('admin.sections.enrollments.destroy', ['section' => $context['section']->id, 'enrollment' => $active->id]))
            ->assertOk();

        Queue::assertPushed(WaitlistPromoter::class);

        app(EnrollmentService::class)->promoteNextFromWaitlist($context['section']->id);

        $this->assertEquals(SectionEnrollment::STATUS_ACTIVE, $waitlisted->fresh()->status);
    }

    public function test_prerequisite_enforced_for_student_enrollment(): void
    {
        $context = $this->createEnrollmentContext(capacity: 2, waitlistCap: 0);
        $admin = $context['admin'];
        $section = $context['section'];
        $student = $context['students'][0];

        $prereqCourse = Course::factory()->create([
            'org_unit_id' => $section->course->org_unit_id,
        ]);

        CoursePrerequisite::create([
            'course_id' => $section->course_id,
            'prereq_course_id' => $prereqCourse->id,
        ]);

        $this->actingAs($admin)
            ->postJson(route('admin.sections.enroll', $section), [
                'student_id' => $student->id,
                'role' => SectionEnrollment::ROLE_STUDENT,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('enrollment');

        Transcript::factory()->create([
            'student_id' => $student->id,
            'course_id' => $prereqCourse->id,
            'term_id' => $section->term_id,
            'final_grade' => 'A',
            'grade_points' => 4.0,
        ]);

        $this->actingAs($admin)
            ->postJson(route('admin.sections.enroll', $section), [
                'student_id' => $student->id,
                'role' => SectionEnrollment::ROLE_STUDENT,
            ])
            ->assertCreated();
    }

    protected function createEnrollmentContext(int $capacity, int $waitlistCap): array
    {
        $branch = Branch::factory()->create();

        $admin = User::factory()->create(['branch_id' => $branch->id]);
        $admin->assignRole('branch_admin');

        $term = Term::factory()->create([
            'branch_id' => $branch->id,
            'add_drop_start' => now()->subDay(),
            'add_drop_end' => now()->addDays(5),
        ]);

        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => $capacity,
            'waitlist_cap' => $waitlistCap,
        ]);

        $students = User::factory()->count(3)->create(['branch_id' => $branch->id]);
        $students->each(fn (User $student) => $student->assignRole('student'));

        return compact('branch', 'admin', 'term', 'course', 'section', 'students');
    }
}
