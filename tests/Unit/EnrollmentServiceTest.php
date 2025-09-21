<?php

namespace Tests\Unit;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\ProgramEnrollment;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use App\Services\Enrollment\EnrollmentService;
use App\Services\Enrollment\Exceptions\DuplicateEnrollmentException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected EnrollmentService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->service = app(EnrollmentService::class);
    }

    public function test_auditor_can_enroll_without_prerequisites(): void
    {
        $context = $this->prepareContext();

        $enrollment = $this->service->enroll(
            $context['admin'],
            $context['student'],
            $context['section'],
            SectionEnrollment::ROLE_AUDITOR
        );

        $this->assertEquals(SectionEnrollment::STATUS_ACTIVE, $enrollment->status);
        $this->assertEquals(SectionEnrollment::ROLE_AUDITOR, $enrollment->role);
    }

    public function test_duplicate_enrollment_throws_exception(): void
    {
        $context = $this->prepareContext();

        $this->service->enroll($context['admin'], $context['student'], $context['section']);

        $this->expectException(DuplicateEnrollmentException::class);

        $this->service->enroll($context['admin'], $context['student'], $context['section']);
    }

    protected function prepareContext(): array
    {
        $branch = Branch::factory()->create();
        $admin = User::factory()->create(['branch_id' => $branch->id]);
        $admin->assignRole('branch_admin');
        $student = User::factory()->create(['branch_id' => $branch->id]);
        $student->assignRole('student');

        $term = Term::factory()->create([
            'branch_id' => $branch->id,
            'add_drop_start' => now()->subDay(),
            'add_drop_end' => now()->addDay(),
        ]);

        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create([
            'course_id' => $course->id,
            'term_id' => $term->id,
            'capacity' => 5,
        ]);

        return compact('branch', 'admin', 'student', 'course', 'term', 'section');
    }
}
