<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class TermIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_branch_admin_sees_only_terms_for_their_branch(): void
    {
        $this->seed(RbacSeeder::class);

        $branchA = Branch::factory()->create(['code' => 'AAA']);
        $branchB = Branch::factory()->create(['code' => 'BBB']);

        $user = User::factory()->create(['branch_id' => $branchA->id]);
        $user->assignRole('branch_admin');

        Term::factory()->count(2)->state(['branch_id' => $branchA->id])->create();
        Term::factory()->count(2)->state(['branch_id' => $branchB->id])->create();

        $response = $this->actingAs($user)->get(route('admin.terms.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/Terms/Index')
            ->has('terms.data', 2, fn (AssertableInertia $term) => $term
                ->where('branch.id', $branchA->id)
                ->etc()
            )
        );
    }
}
