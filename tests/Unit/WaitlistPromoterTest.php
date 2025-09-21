<?php

namespace Tests\Unit;

use App\Jobs\WaitlistPromoter;
use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use App\Notifications\Enrollment\WaitlistPromotionNotification;
use App\Services\Enrollment\EnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class WaitlistPromoterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_job_promotes_waitlisted_student_and_sends_notification(): void
    {
        Notification::fake();

        $branch = Branch::factory()->create();
        $term = Term::factory()->create(['branch_id' => $branch->id]);
        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create(['course_id' => $course->id, 'term_id' => $term->id, 'capacity' => 2]);

        $student = User::factory()->create(['branch_id' => $branch->id]);
        $student->assignRole('student');

        $waitlisted = SectionEnrollment::factory()->waitlisted()->create([
            'section_id' => $section->id,
            'student_id' => $student->id,
        ]);

        $service = app(EnrollmentService::class);

        $job = new WaitlistPromoter($section->id);
        $job->handle($service);

        Notification::assertSentTo($student, WaitlistPromotionNotification::class);
        $this->assertEquals(SectionEnrollment::STATUS_ACTIVE, $waitlisted->fresh()->status);
    }
}
