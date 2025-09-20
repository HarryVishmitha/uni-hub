<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class CourseShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_course_show_includes_outcomes_and_prerequisites(): void
    {
        $this->seed(RbacSeeder::class);

        $branch = Branch::factory()->create();
        $orgUnit = OrgUnit::factory()->state(['branch_id' => $branch->id])->create();

        $course = Course::factory()->state([
            'org_unit_id' => $orgUnit->id,
            'status' => 'active',
        ])->create();

        $prerequisiteCourse = Course::factory()->state([
            'org_unit_id' => $orgUnit->id,
            'status' => 'active',
        ])->create();

        $course->outcomes()->create([
            'outcome_code' => 'LO1',
            'description' => 'Understand advanced concepts.',
        ]);

        $course->prerequisites()->attach($prerequisiteCourse->id, ['min_grade' => 'B']);

        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $response = $this->actingAs($user)->get(route('admin.courses.show', $course->id));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/Courses/Show')
            ->has('course.outcomes', 1)
            ->has('course.prerequisites', 1)
        );
    }
}
