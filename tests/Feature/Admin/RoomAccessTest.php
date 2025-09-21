<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Room;
use App\Models\Section;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RoomAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    public function test_branch_admin_cannot_view_rooms_from_other_branch(): void
    {
        $branchA = Branch::factory()->create();
        $branchB = Branch::factory()->create();

        $roomA = Room::factory()->state(['branch_id' => $branchA->id])->create();
        $roomB = Room::factory()->state(['branch_id' => $branchB->id])->create();

        $user = User::factory()->create(['branch_id' => $branchA->id]);
        $user->assignRole('branch_admin');

        $this->actingAs($user)
            ->get(route('admin.rooms.index'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Rooms/Index')
                ->where('rooms.data.0.id', $roomA->id)
            );

        $this->actingAs($user)
            ->get(route('admin.rooms.index', ['branch_id' => $branchB->id]))
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('admin.rooms.index'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Rooms/Index')
                ->where('rooms.data', fn ($rooms) => collect($rooms)->contains('id', $roomB->id) === false)
            );
    }

    public function test_branch_admin_cannot_view_sections_outside_branch(): void
    {
        $branchA = Branch::factory()->create();
        $branchB = Branch::factory()->create();

        $orgUnitA = OrgUnit::factory()->state(['branch_id' => $branchA->id])->create();
        $orgUnitB = OrgUnit::factory()->state(['branch_id' => $branchB->id])->create();

        $courseA = Course::factory()->state(['org_unit_id' => $orgUnitA->id])->create();
        $courseB = Course::factory()->state(['org_unit_id' => $orgUnitB->id])->create();

        $termA = Term::factory()->state(['branch_id' => $branchA->id, 'status' => 'active'])->create();
        $termB = Term::factory()->state(['branch_id' => $branchB->id, 'status' => 'active'])->create();

        Section::factory()->for($courseA)->for($termA)->state(['section_code' => 'A1'])->create();
        Section::factory()->for($courseB)->for($termB)->state(['section_code' => 'B1'])->create();

        $user = User::factory()->create(['branch_id' => $branchA->id]);
        $user->assignRole('branch_admin');

        $this->actingAs($user)
            ->get(route('admin.sections.index'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Sections/Index')
                ->where('sections.data', fn ($sections) =>
                    collect($sections)->every(fn ($section) => $section['section_code'] !== 'B1')
                )
            );
    }
}
