<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Support\Timetable\TimetableService;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    public function __construct(private readonly TimetableService $timetable)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $termFilter = $request->integer('term_id');

        $enrollments = SectionEnrollment::query()
            ->with(['section.course', 'section.term.branch', 'section.meetings.room'])
            ->where('student_id', $user->id)
            ->whereIn('status', [SectionEnrollment::STATUS_ACTIVE, SectionEnrollment::STATUS_WAITLISTED])
            ->when($termFilter, fn ($query) => $query->whereHas('section', fn ($inner) => $inner->where('term_id', $termFilter)))
            ->orderBy('section_id')
            ->get();

        $schedule = $this->buildSchedule($enrollments);
        $upcoming = $this->buildUpcomingSessions($enrollments);

        $terms = Term::query()
            ->whereHas('sections.enrollments', fn ($builder) => $builder
                ->where('student_id', $user->id)
                ->whereIn('status', [SectionEnrollment::STATUS_ACTIVE, SectionEnrollment::STATUS_WAITLISTED]))
            ->orderByDesc('start_date')
            ->get(['id', 'title', 'code']);

        return Inertia::render('Account/Timetable/Index', [
            'filters' => [
                'term_id' => $termFilter,
            ],
            'schedule' => $schedule,
            'upcoming' => $upcoming,
            'termOptions' => $terms,
            'icsUrl' => route('account.timetable.ics', array_filter(['term_id' => $termFilter])),
        ]);
    }

    public function ics(Request $request)
    {
        $user = $request->user();
        $termFilter = $request->integer('term_id');

        $enrollments = SectionEnrollment::query()
            ->with(['section.course', 'section.term.branch', 'section.meetings.room'])
            ->where('student_id', $user->id)
            ->whereIn('status', [SectionEnrollment::STATUS_ACTIVE, SectionEnrollment::STATUS_WAITLISTED])
            ->when($termFilter, fn ($query) => $query->whereHas('section', fn ($inner) => $inner->where('term_id', $termFilter)))
            ->orderBy('section_id')
            ->get();

        $ics = $this->buildIcsCalendar($user->id, $enrollments);

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="my-timetable.ics"',
        ]);
    }

    protected function buildSchedule(Collection $enrollments): array
    {
        $schedule = collect(range(0, 6))->mapWithKeys(fn ($day) => [$day => []]);

        foreach ($enrollments as $enrollment) {
            $section = $enrollment->section;
            if (! $section) {
                continue;
            }

            $course = $section->course;
            foreach ($section->meetings as $meeting) {
                $day = $meeting->day_of_week;
                $schedule[$day][] = [
                    'section_id' => $section->id,
                    'meeting_id' => $meeting->id,
                    'status' => $enrollment->status,
                    'course_code' => $course?->code,
                    'course_title' => $course?->title,
                    'section_code' => $section->section_code,
                    'start_time' => $meeting->start_time?->format('H:i'),
                    'end_time' => $meeting->end_time?->format('H:i'),
                    'modality' => $meeting->modality,
                    'room' => $meeting->room ? trim(implode(' ', array_filter([
                        $meeting->room->building,
                        $meeting->room->room_no,
                        $meeting->room->name ? '(' . $meeting->room->name . ')' : null,
                    ]))) : null,
                ];
            }
        }

        return $schedule->map(function ($items) {
            return collect($items)->sortBy('start_time')->values()->all();
        })->toArray();
    }

    protected function buildUpcomingSessions(Collection $enrollments): array
    {
        $now = CarbonImmutable::now();
        $occurrences = collect();

        foreach ($enrollments as $enrollment) {
            $section = $enrollment->section;
            $course = $section?->course;
            $term = $section?->term;

            if (! $section || ! $term) {
                continue;
            }

            foreach ($section->meetings as $meeting) {
                $expanded = $this->timetable->expandOccurrences($meeting, $term);
                $expanded->each(function (array $occurrence) use ($now, $enrollment, $course, $section, $occurrences) {
                    $start = $occurrence['start'];
                    $end = $occurrence['end'];

                    if ($start->lt($now)) {
                        return;
                    }

                    $occurrences->push([
                        'section_id' => $section->id,
                        'meeting_id' => $occurrence['meeting_id'],
                        'status' => $enrollment->status,
                        'course_code' => $course?->code,
                        'course_title' => $course?->title,
                        'section_code' => $section->section_code,
                        'start' => $start->toIso8601String(),
                        'end' => $end->toIso8601String(),
                        'day_name' => $this->dayName($start->dayOfWeek),
                    ]);
                });
            }
        }

        return $occurrences
            ->sortBy('start')
            ->take(10)
            ->values()
            ->all();
    }

    protected function buildIcsCalendar(int $studentId, Collection $enrollments): string
    {
        $timezone = config('app.timezone', 'UTC');
        $calendarName = 'My Courses';

        foreach ($enrollments as $enrollment) {
            if ($enrollment->section?->term?->branch?->timezone) {
                $timezone = $enrollment->section->term->branch->timezone;
                break;
            }
        }

        $lines = [
            'BEGIN:VCALENDAR',
            'PRODID:-//UniHub//Student Timetable//EN',
            'VERSION:2.0',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:'.$this->escapeText($calendarName),
            'X-WR-TIMEZONE:'.$timezone,
        ];

        foreach ($enrollments as $enrollment) {
            $section = $enrollment->section;
            $course = $section?->course;
            $term = $section?->term;

            if (! $section || ! $term) {
                continue;
            }

            foreach ($section->meetings as $meeting) {
                $eventLines = $this->buildEventLines($studentId, $enrollment->status, $section, $course?->code, $course?->title, $meeting, $term, $timezone);
                if (! empty($eventLines)) {
                    $lines = array_merge($lines, $eventLines);
                }
            }
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines)."\r\n";
    }

    protected function buildEventLines(
        int $studentId,
        string $status,
        $section,
        ?string $courseCode,
        ?string $courseTitle,
        $meeting,
        $term,
        string $timezone
    ): array {
        $summaryBase = trim($courseCode.' '.($section->section_code ?? ''));
        $summary = $summaryBase === '' ? 'Course Meeting' : $summaryBase;

        $firstDate = $this->timetable->firstOccurrenceDate($meeting->toArray(), $term);
        if (! $firstDate) {
            return [];
        }

        $start = $firstDate->setTimeFromTimeString($meeting->start_time->format('H:i:s'))->setTimezone($timezone);
        $end = $firstDate->setTimeFromTimeString($meeting->end_time->format('H:i:s'))->setTimezone($timezone);
        $until = $this->timetable->recurrenceEndDate($meeting->toArray(), $term)?->setTimeFromTimeString($meeting->end_time->format('H:i:s'));
        $exdates = $this->timetable->exceptionDates($meeting->toArray(), $term);

        $uid = sprintf('student-%d-section-%d-meeting-%d@uni-hub', $studentId, $section->id, $meeting->id);
        $byDay = $this->mapWeekday($meeting->day_of_week);

        $lines = [
            'BEGIN:VEVENT',
            'UID:'.$uid,
            'SUMMARY:'.$this->escapeText($summary),
            'DTSTAMP:'.CarbonImmutable::now()->setTimezone('UTC')->format('Ymd\THis\Z'),
            'DTSTART;TZID='.$timezone.':'.$start->format('Ymd\THis'),
            'DTEND;TZID='.$timezone.':'.$end->format('Ymd\THis'),
            'RRULE:FREQ=WEEKLY;BYDAY='.$byDay.($until ? ';UNTIL='.$until->setTimezone('UTC')->format('Ymd\THis\Z') : ''),
        ];

        foreach ($exdates as $date) {
            $lines[] = 'EXDATE;TZID='.$timezone.':'.$date->setTimeFromTimeString($meeting->start_time->format('H:i:s'))->format('Ymd\THis');
        }

        $description = [$courseTitle, 'Section '.$section->section_code];
        $description[] = 'Status: '.Str::headline($status);
        if ($term->title || $term->code) {
            $description[] = 'Term: '.($term->title ?? $term->code);
        }

        $lines[] = 'LOCATION:'.$this->escapeText($meeting->room ? trim(implode(' ', array_filter([
            $meeting->room->building,
            $meeting->room->room_no,
            $meeting->room->name ? '(' . $meeting->room->name . ')' : null,
        ]))) : '');
        $lines[] = 'DESCRIPTION:'.$this->escapeText(implode('\\n', array_filter($description)));
        $lines[] = 'STATUS:'.($status === SectionEnrollment::STATUS_ACTIVE ? 'CONFIRMED' : 'TENTATIVE');
        $lines[] = 'END:VEVENT';

        return $lines;
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

    protected function dayName(int $day): string
    {
        return match ($day) {
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
            default => 'Day',
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
