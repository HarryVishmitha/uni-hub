<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use App\Models\Course;
use App\Models\OrgUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectionRosterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_branch_admin_can_view_roster_for_their_branch(): void
    {
        $branchAdmin = User::factory()->create();
        $branchAdmin->assignRole('branch_admin');
        $branch = Branch::factory()->create();
        $branchAdmin->update(['branch_id' => $branch->id]);

        $term = Term::factory()->create(['branch_id' => $branch->id, 'add_drop_start' => now()->subWeek(), 'add_drop_end' => now()->addWeek()]);
        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branch->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create(['term_id' => $term->id, 'course_id' => $course->id]);

        $student = User::factory()->create(['branch_id' => $branch->id]);
        $student->assignRole('student');
        SectionEnrollment::factory()->create(['section_id' => $section->id, 'student_id' => $student->id]);

        $response = $this->actingAs($branchAdmin)
            ->getJson(route('admin.sections.roster', $section));

        $response->assertOk()
            ->assertJsonStructure(['data', 'next_cursor', 'prev_cursor']);
    }

    public function test_branch_admin_cannot_access_roster_from_another_branch(): void
    {
        $branchOne = Branch::factory()->create();
        $branchTwo = Branch::factory()->create();

        $admin = User::factory()->create(['branch_id' => $branchOne->id]);
        $admin->assignRole('branch_admin');

        $term = Term::factory()->create(['branch_id' => $branchTwo->id, 'add_drop_start' => now()->subWeek(), 'add_drop_end' => now()->addWeek()]);
        $orgUnit = OrgUnit::factory()->create(['branch_id' => $branchTwo->id]);
        $course = Course::factory()->create(['org_unit_id' => $orgUnit->id]);
        $section = Section::factory()->create(['term_id' => $term->id, 'course_id' => $course->id]);

        $response = $this->actingAs($admin)
            ->get(route('admin.sections.roster', $section));

        $response->assertForbidden();
    }
}
