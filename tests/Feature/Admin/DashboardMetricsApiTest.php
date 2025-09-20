<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardMetricsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_branch_admin_metrics_scope_to_branch(): void
    {
        $this->seed(RbacSeeder::class);

        $branchA = Branch::factory()->create(['code' => 'AAA']);
        $branchB = Branch::factory()->create(['code' => 'BBB']);

        $orgA = OrgUnit::factory()->state(['branch_id' => $branchA->id])->create();
        $orgB = OrgUnit::factory()->state(['branch_id' => $branchB->id])->create();

        Term::factory()->count(2)->state(['branch_id' => $branchA->id])->create();
        Term::factory()->count(3)->state(['branch_id' => $branchB->id])->create();

        Course::factory()->count(2)->state(['org_unit_id' => $orgA->id])->create();
        Course::factory()->count(4)->state(['org_unit_id' => $orgB->id])->create();

        $user = User::factory()->create(['branch_id' => $branchA->id]);
        $user->assignRole('branch_admin');

        $response = $this->actingAs($user)->getJson(route('admin.api.metrics'));

        $response->assertOk();
        $overview = collect($response->json('cards.overview'))->keyBy('key');

        $this->assertEquals(1, $overview['branches']['value']);
        $this->assertEquals(2, $overview['terms']['value']);
        $this->assertEquals(2, $overview['courses']['value']);
    }

    public function test_super_admin_metrics_include_all_branches(): void
    {
        $this->seed(RbacSeeder::class);

        $branchA = Branch::factory()->create();
        $branchB = Branch::factory()->create();

        $orgA = OrgUnit::factory()->state(['branch_id' => $branchA->id])->create();
        $orgB = OrgUnit::factory()->state(['branch_id' => $branchB->id])->create();

        Term::factory()->count(2)->state(['branch_id' => $branchA->id])->create();
        Term::factory()->count(1)->state(['branch_id' => $branchB->id])->create();

        Course::factory()->count(1)->state(['org_unit_id' => $orgA->id])->create();
        Course::factory()->count(2)->state(['org_unit_id' => $orgB->id])->create();

        $user = User::factory()->create();
        $user->assignRole('super_admin');

        $response = $this->actingAs($user)->getJson(route('admin.api.metrics'));

        $response->assertOk();
        $overview = collect($response->json('cards.overview'))->keyBy('key');

        $this->assertEquals(2, $overview['branches']['value']);
        $this->assertEquals(3, $overview['terms']['value']);
        $this->assertEquals(3, $overview['courses']['value']);
    }
}
