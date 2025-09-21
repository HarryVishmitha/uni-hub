<?php

namespace Tests\Feature\Admin;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Course;
use App\Models\OrgUnit;
use App\Models\Room;
use App\Models\Section;
use App\Models\SectionMeeting;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SectionConflictTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbacSeeder::class);
    }

    protected function createAdmin(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole('admin');

        return $user;
    }

    protected function createCourseForBranch(Branch $branch): Course
    {
        $orgUnit = OrgUnit::factory()->state(['branch_id' => $branch->id])->create();

        return Course::factory()->state(['org_unit_id' => $orgUnit->id])->create();
    }

    protected function createTermForBranch(Branch $branch): Term
    {
        return Term::factory()->state([
            'branch_id' => $branch->id,
            'status' => 'active',
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->addMonths(3),
        ])->create();
    }

    public function test_room_conflict_causes_validation_error(): void
    {
        $branch = Branch::factory()->create();
        $term = $this->createTermForBranch($branch);
        $courseA = $this->createCourseForBranch($branch);
        $courseB = $this->createCourseForBranch($branch);
        $room = Room::factory()->state(['branch_id' => $branch->id, 'is_active' => true])->create();

        $sectionA = Section::factory()->for($courseA)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($sectionA)->state([
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
            'repeat_rule' => ['freq' => 'WEEKLY', 'until' => optional($term->end_date)->format('Y-m-d')],
        ])->create();

        $sectionB = Section::factory()->for($courseB)->for($term)->state(['status' => 'active'])->create();

        $admin = $this->createAdmin(['branch_id' => $branch->id]);

        $response = $this->actingAs($admin)
            ->post(route('admin.sections.meetings.store', $sectionB), [
                'day_of_week' => 1,
                'start_time' => '09:00',
                'end_time' => '10:00',
                'modality' => 'onsite',
                'room_id' => $room->id,
                'repeat_rule' => ['freq' => 'WEEKLY'],
            ], ['Accept' => 'application/json']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['room_id', 'conflict_matrix']);
    }

    public function test_instructor_conflict_blocks_assignment(): void
    {
        $branch = Branch::factory()->create();
        $term = $this->createTermForBranch($branch);
        $courseA = $this->createCourseForBranch($branch);
        $courseB = $this->createCourseForBranch($branch);
        $room = Room::factory()->state(['branch_id' => $branch->id, 'is_active' => true])->create();

        $sectionA = Section::factory()->for($courseA)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($sectionA)->state([
            'day_of_week' => 2,
            'start_time' => '11:00',
            'end_time' => '12:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
        ])->create();

        $sectionB = Section::factory()->for($courseB)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($sectionB)->state([
            'day_of_week' => 2,
            'start_time' => '11:00',
            'end_time' => '12:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
        ])->create();

        $lecturer = User::factory()->create(['branch_id' => $branch->id]);
        $lecturer->assignRole('lecturer');

        Appointment::factory()->for($sectionA)->for($lecturer)->state([
            'role' => 'lecturer',
            'load_percent' => 60,
        ])->create();

        $admin = $this->createAdmin(['branch_id' => $branch->id]);

        $response = $this->actingAs($admin)
            ->post(route('admin.sections.appointments.store', $sectionB), [
                'user_id' => $lecturer->id,
                'role' => 'lecturer',
                'load_percent' => 60,
            ], ['Accept' => 'application/json']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['user_id', 'conflict_matrix']);
    }

    public function test_ics_endpoint_returns_calendar(): void
    {
        $branch = Branch::factory()->create();
        $term = $this->createTermForBranch($branch);
        $course = $this->createCourseForBranch($branch);
        $room = Room::factory()->state(['branch_id' => $branch->id, 'is_active' => true])->create();
        $section = Section::factory()->for($course)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($section)->state([
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
        ])->create();

        $admin = $this->createAdmin(['branch_id' => $branch->id]);

        $response = $this->actingAs($admin)->get(route('admin.api.sections.ics', $section));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/calendar; charset=utf-8');
        $response->assertSee('BEGIN:VCALENDAR');
        $response->assertSee('RRULE:FREQ=WEEKLY');
        $response->assertSee('SUMMARY');
    }

    public function test_assignment_load_cannot_exceed_hundred_percent(): void
    {
        $branch = Branch::factory()->create();
        $term = $this->createTermForBranch($branch);
        $course = $this->createCourseForBranch($branch);
        $room = Room::factory()->state(['branch_id' => $branch->id, 'is_active' => true])->create();
        $section = Section::factory()->for($course)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($section)->state([
            'day_of_week' => 3,
            'start_time' => '13:00',
            'end_time' => '14:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
        ])->create();

        $lecturer = User::factory()->create(['branch_id' => $branch->id]);
        $lecturer->assignRole('lecturer');

        Appointment::factory()->for($section)->for($lecturer)->state([
            'role' => 'lecturer',
            'load_percent' => 80,
        ])->create();

        $admin = $this->createAdmin(['branch_id' => $branch->id]);

        $response = $this->actingAs($admin)->post(route('admin.sections.appointments.store', $section), [
            'user_id' => $lecturer->id,
            'role' => 'ta',
            'load_percent' => 30,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['load_percent']);
    }

    public function test_conflict_matrix_api_returns_expected_structure(): void
    {
        $branch = Branch::factory()->create();
        $term = $this->createTermForBranch($branch);
        $course = $this->createCourseForBranch($branch);
        $room = Room::factory()->state(['branch_id' => $branch->id, 'is_active' => true])->create();
        $section = Section::factory()->for($course)->for($term)->state(['status' => 'active'])->create();
        SectionMeeting::factory()->for($section)->state([
            'day_of_week' => 4,
            'start_time' => '08:00',
            'end_time' => '09:00',
            'modality' => 'onsite',
            'room_id' => $room->id,
        ])->create();

        $admin = $this->createAdmin(['branch_id' => $branch->id]);

        $response = $this->actingAs($admin)
            ->post(route('admin.api.sections.conflicts', $section), [], ['Accept' => 'application/json']);

        $response->assertOk();
        $response->assertJsonStructure([
            'room',
            'teacher',
        ]);
    }
}
