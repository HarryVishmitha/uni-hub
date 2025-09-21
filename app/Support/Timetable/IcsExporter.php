<?php

namespace App\Support\Timetable;

use App\Models\Section;
use App\Models\SectionMeeting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;

class IcsExporter
{
    public function __construct(private readonly TimetableService $timetable)
    {
    }

    public function exportSection(Section $section): string
    {
        $section->loadMissing(['term.branch', 'course', 'meetings.room']);

        $timezone = $section->term?->branch?->timezone ?? config('app.timezone', 'UTC');
        $courseCode = $section->course?->code ?? 'Course';
        $summaryBase = trim($courseCode.' '.$section->section_code);

        $lines = [
            'BEGIN:VCALENDAR',
            'PRODID:-//UniHub//Timetable//EN',
            'VERSION:2.0',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:'.($section->term?->title ? $section->term->title.' Timetable' : 'Section Timetable'),
            'X-WR-TIMEZONE:'.$timezone,
        ];

        foreach ($section->meetings as $meeting) {
            $lines = array_merge($lines, $this->buildEvent($section, $meeting, $timezone, $summaryBase));
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines)."\r\n";
    }

    protected function buildEvent(Section $section, SectionMeeting $meeting, string $timezone, string $summaryBase): array
    {
        $term = $section->term;
        $meetingData = $meeting->toArray();

        $firstDate = $this->timetable->firstOccurrenceDate($meetingData, $term);
        if (! $firstDate) {
            return [];
        }

        $start = $firstDate->setTimeFromTimeString($meeting->start_time->format('H:i:s'))->setTimezone($timezone);
        $end = $firstDate->setTimeFromTimeString($meeting->end_time->format('H:i:s'))->setTimezone($timezone);
        $until = $this->timetable->recurrenceEndDate($meetingData, $term)?->setTimeFromTimeString($meeting->end_time->format('H:i:s'));
        $exdates = $this->timetable->exceptionDates($meetingData, $term);

        $uid = sprintf('section-%d-meeting-%d@uni-hub', $section->id, $meeting->id);
        $byDay = $this->mapWeekday($meeting->day_of_week);

        $lines = [
            'BEGIN:VEVENT',
            'UID:'.$uid,
            'SUMMARY:'.$this->escapeText($summaryBase),
            'DTSTAMP:'.CarbonImmutable::now()->setTimezone('UTC')->format('Ymd\THis\Z'),
            'DTSTART;TZID='.$timezone.':'.$start->format('Ymd\THis'),
            'DTEND;TZID='.$timezone.':'.$end->format('Ymd\THis'),
            'RRULE:FREQ=WEEKLY;BYDAY='.$byDay.($until ? ';UNTIL='.$until->setTimezone('UTC')->format('Ymd\THis\Z') : ''),
        ];

        foreach ($exdates as $date) {
            $lines[] = 'EXDATE;TZID='.$timezone.':'.$date->setTimeFromTimeString($meeting->start_time->format('H:i:s'))->format('Ymd\THis');
        }

        $lines[] = 'LOCATION:'.$this->escapeText($this->resolveLocation($meeting));
        $lines[] = 'DESCRIPTION:'.$this->escapeText($this->buildDescription($section, $meeting));
        $lines[] = 'STATUS:CONFIRMED';
        $lines[] = 'END:VEVENT';

        return $lines;
    }

    protected function resolveLocation(SectionMeeting $meeting): string
    {
        if ($meeting->modality === 'online') {
            return 'Online';
        }

        if ($meeting->room) {
            $parts = [
                $meeting->room->building,
                $meeting->room->room_no,
            ];

            if ($meeting->room->name) {
                $parts[] = '(' . $meeting->room->name . ')';
            }

            return trim(implode(' ', array_filter($parts)));
        }

        return 'Hybrid / TBD';
    }

    protected function buildDescription(Section $section, SectionMeeting $meeting): string
    {
        $term = $section->term;
        $courseTitle = $section->course?->title ?? '';
        $room = $meeting->room?->name ?? $meeting->room?->room_no;

        $lines = [
            $courseTitle,
            'Term: '.($term?->title ?? $term?->code ?? ''),
            'Section: '.$section->section_code,
            'Modality: '.ucfirst($meeting->modality),
        ];

        if ($room) {
            $lines[] = 'Room: '.$room;
        }

        return implode('\\n', array_filter($lines));
    }

    protected function mapWeekday(int $dayOfWeek): string
    {
        return match ($dayOfWeek) {
            0 => 'SU',
            1 => 'MO',
            2 => 'TU',
            3 => 'WE',
            4 => 'TH',
            5 => 'FR',
            6 => 'SA',
            default => 'MO',
        };
    }

    protected function escapeText(string $value): string
    {
        return Str::of($value)
            ->replace('\\', '\\\\')
            ->replace(';', '\\;')
            ->replace(',', '\\,')
            ->replace("\n", '\\n')
            ->replace("\r", '')
            ->value();
    }
}
