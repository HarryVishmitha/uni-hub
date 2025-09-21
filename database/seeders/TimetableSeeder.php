<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Branch;
use App\Models\Course;
use App\Models\Room;
use App\Models\Section;
use App\Models\SectionMeeting;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Spatie\Permission\Models\Role;

class TimetableSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureRoles();

        $branches = Branch::all();

        foreach ($branches as $branch) {
            $rooms = Room::factory()
                ->count(10)
                ->state(['branch_id' => $branch->id])
                ->create();

            fake()->unique(true);

            $terms = Term::query()
                ->where('branch_id', $branch->id)
                ->whereIn('status', ['planned', 'active'])
                ->orderBy('start_date')
                ->get();

            $courses = Course::query()
                ->whereHas('orgUnit', fn ($q) => $q->where('branch_id', $branch->id))
                ->with('orgUnit')
                ->get();

            if ($courses->isEmpty() || $terms->isEmpty()) {
                continue;
            }

            $lecturers = User::role('lecturer')->where('branch_id', $branch->id)->get();
            if ($lecturers->isEmpty()) {
                $lecturers = collect([
                    User::factory()->create([
                        'branch_id' => $branch->id,
                        'name' => fake()->name().' (Lecturer)',
                        'email' => fake()->unique()->safeEmail(),
                    ]),
                ])->each(fn (User $user) => $user->assignRole('lecturer'));
            }

            $assistants = User::role('ta')->where('branch_id', $branch->id)->get();
            if ($assistants->isEmpty()) {
                $assistants = collect([
                    User::factory()->create([
                        'branch_id' => $branch->id,
                        'name' => fake()->name().' (TA)',
                        'email' => fake()->unique()->safeEmail(),
                    ]),
                ])->each(fn (User $user) => $user->assignRole('ta'));
            }

            foreach ($terms as $term) {
                $selectedCourses = $courses->shuffle()->take(min(4, $courses->count()));

                foreach ($selectedCourses as $course) {
                    $section = Section::factory()
                        ->for($course)
                        ->for($term)
                        ->state(['status' => Arr::random(['planned', 'active'])])
                        ->create();

                    $meetingRooms = $rooms->shuffle();
                    $meetingDays = collect([1, 3, 4, 5])->shuffle();

                    for ($i = 0; $i < 2; $i++) {
                        $day = $meetingDays[$i % $meetingDays->count()];
                        $startHour = 9 + ($i * 2);
                        $start = sprintf('%02d:00', $startHour);
                        $end = sprintf('%02d:50', $startHour + 1);
                        $room = $meetingRooms[$i % $meetingRooms->count()];

                        SectionMeeting::factory()
                            ->for($section)
                            ->state([
                                'day_of_week' => $day,
                                'start_time' => $start,
                                'end_time' => $end,
                                'modality' => 'onsite',
                                'room_id' => $room->id,
                                'repeat_rule' => [
                                    'freq' => 'WEEKLY',
                                    'until' => optional($term->end_date)->format('Y-m-d'),
                                ],
                            ])
                            ->create();
                    }

                    $lecturer = $lecturers->random();
                    Appointment::factory()
                        ->for($section)
                        ->for($lecturer)
                        ->state([
                            'role' => 'lecturer',
                            'load_percent' => 60,
                        ])
                        ->create();

                    if ($assistants->isNotEmpty() && fake()->boolean(70)) {
                        $assistant = $assistants->random();
                        Appointment::factory()
                            ->for($section)
                            ->for($assistant)
                            ->state([
                                'role' => 'ta',
                                'load_percent' => 40,
                            ])
                            ->create();
                    }
                }
            }
        }
    }

    protected function ensureRoles(): void
    {
        foreach (['lecturer', 'ta'] as $role) {
            Role::findOrCreate($role, 'web');
        }
    }
}
