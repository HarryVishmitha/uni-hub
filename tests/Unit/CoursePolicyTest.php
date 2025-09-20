<?php

namespace Tests\Unit;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\User;
use App\Policies\CoursePolicy;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class CoursePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected CoursePolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
        $this->policy = new CoursePolicy();
    }

    public function test_branch_admin_can_manage_course_within_branch(): void
    {
        $branch = Branch::factory()->create();
        $orgUnit = OrgUnit::factory()->state(['branch_id' => $branch->id])->create();
        $course = Course::factory()->state(['org_unit_id' => $orgUnit->id])->create();

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $this->assertTrue(Gate::forUser($user)->allows('update', $course));
        $this->assertTrue(Gate::forUser($user)->allows('delete', $course));
    }

    public function test_branch_admin_cannot_manage_course_from_other_branch(): void
    {
        $branch = Branch::factory()->create();
        $otherBranch = Branch::factory()->create();

        $orgUnit = OrgUnit::factory()->state(['branch_id' => $otherBranch->id])->create();
        $course = Course::factory()->state(['org_unit_id' => $orgUnit->id])->create();

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $this->assertFalse(Gate::forUser($user)->allows('update', $course));
    }

    public function test_super_admin_bypasses_branch_checks(): void
    {
        $branch = Branch::factory()->create();
        $orgUnit = OrgUnit::factory()->state(['branch_id' => $branch->id])->create();
        $course = Course::factory()->state(['org_unit_id' => $orgUnit->id])->create();

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $this->assertTrue(Gate::forUser($user)->allows('update', $course));
        $this->assertTrue(Gate::forUser($user)->allows('delete', $course));
    }
}
