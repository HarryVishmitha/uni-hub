<?php

namespace Tests\Feature\Admin;

use App\Models\Branch;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    public function test_branch_admin_can_create_room(): void
    {
        $branch = Branch::factory()->create();
        $user = User::factory()->create(['branch_id' => $branch->id]);
        $user->assignRole('branch_admin');

        $response = $this->actingAs($user)->post(route('admin.rooms.store'), [
            'branch_id' => $branch->id,
            'building' => 'Science Center',
            'room_no' => '201',
            'name' => 'Physics Lab',
            'seats' => 40,
            'equipment' => ['Projector'],
            'is_active' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rooms', [
            'branch_id' => $branch->id,
            'building' => 'Science Center',
            'room_no' => '201',
        ]);
    }
}
