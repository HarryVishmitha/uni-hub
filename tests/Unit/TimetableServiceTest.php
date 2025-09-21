<?php

namespace Tests\Unit;

use App\Models\Term;
use App\Support\Timetable\TimetableService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimetableServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_expand_occurrences_generates_weekly_instances(): void
    {
        $term = Term::factory()->create([
            'start_date' => '2025-01-06', // Monday
            'end_date' => '2025-01-27',
            'status' => 'active',
        ]);

        $service = new TimetableService();
        $meeting = [
            'id' => 1,
            'section_id' => 1,
            'day_of_week' => 1,
            'start_time' => '09:00:00',
            'end_time' => '10:00:00',
            'repeat_rule' => ['freq' => 'WEEKLY'],
        ];

        $occurrences = $service->expandOccurrences($meeting, $term);

        $this->assertCount(4, $occurrences);
        $this->assertSame('2025-01-06 09:00', $occurrences[0]['start']->format('Y-m-d H:i'));
        $this->assertSame('2025-01-27 10:00', $occurrences->last()['end']->format('Y-m-d H:i'));
    }

    public function test_expand_occurrences_honours_exception_dates(): void
    {
        $term = Term::factory()->create([
            'start_date' => '2025-02-03',
            'end_date' => '2025-02-24',
            'status' => 'active',
        ]);

        $service = new TimetableService();
        $meeting = [
            'id' => 2,
            'section_id' => 1,
            'day_of_week' => 1,
            'start_time' => '11:00:00',
            'end_time' => '12:00:00',
            'repeat_rule' => [
                'freq' => 'WEEKLY',
                'exdates' => ['2025-02-10'],
            ],
        ];

        $occurrences = $service->expandOccurrences($meeting, $term);

        $this->assertCount(3, $occurrences);
        $dates = $occurrences->map(fn ($occurrence) => $occurrence['start']->format('Y-m-d'))->all();
        $this->assertNotContains('2025-02-10', $dates);
    }
}
