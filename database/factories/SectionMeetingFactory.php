<?php

namespace Database\Factories;

use App\Models\Room;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

/**
 * @extends Factory<\App\Models\SectionMeeting>
 */
class SectionMeetingFactory extends Factory
{
    public function definition(): array
    {
        $startHour = fake()->numberBetween(8, 17);
        $startMinute = fake()->randomElement([0, 30]);
        $durationHours = fake()->randomElement([1, 2]);
        $start = Carbon::createFromTime($startHour, $startMinute);
        $end = (clone $start)->addHours($durationHours);

        $modality = Arr::random(['onsite', 'online', 'hybrid']);

        return [
            'section_id' => Section::factory(),
            'day_of_week' => fake()->numberBetween(0, 6),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'room_id' => $modality === 'onsite' ? Room::factory() : null,
            'modality' => $modality,
            'repeat_rule' => null,
        ];
    }
}
