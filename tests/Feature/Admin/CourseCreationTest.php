<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_branch_admin_cannot_create_course_outside_branch(): void
    {
        $this->seed(RbacSeeder::class);

        $branchA = Branch::factory()->create();
        $branchB = Branch::factory()->create();

        $orgUnitA = OrgUnit::factory()->state(['branch_id' => $branchA->id])->create();
        $orgUnitB = OrgUnit::factory()->state(['branch_id' => $branchB->id])->create();

        $user = User::factory()->create(['branch_id' => $branchA->id]);
        $user->assignRole('branch_admin');

        $invalidPayload = [
            'org_unit_id' => $orgUnitB->id,
            'code' => 'CSC101',
            'title' => 'Data Structures',
            'credit_hours' => 3,
            'delivery_mode' => 'onsite',
            'status' => 'draft',
        ];

        $response = $this->actingAs($user)->post(route('admin.courses.store'), $invalidPayload);
        $response->assertSessionHasErrors('org_unit_id');

        $validPayload = [
            'org_unit_id' => $orgUnitA->id,
            'code' => 'CSC102',
            'title' => 'Algorithms',
            'credit_hours' => 4,
            'delivery_mode' => 'online',
            'status' => 'active',
        ];

        $response = $this->actingAs($user)->post(route('admin.courses.store'), $validPayload);
        $response->assertSessionDoesntHaveErrors();

        $courseId = Course::query()->where('code', 'CSC102')->value('id');

        $response->assertRedirect(route('admin.courses.show', $courseId));
        $this->assertDatabaseHas('courses', [
            'id' => $courseId,
            'org_unit_id' => $orgUnitA->id,
        ]);
    }
}
