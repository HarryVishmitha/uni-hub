<?php

namespace App\Services\Enrollment;

use App\Models\Course;
use App\Models\SectionEnrollment;
use App\Models\Transcript;
use App\Models\User;
use Illuminate\Support\Collection;

class PrerequisiteChecker
{
    private const DEFAULT_PASSING_POINTS = 2.0;

    /**
     * Letter grade to grade-point conversions.
     * @var array<string, float>
     */
    private const GRADE_POINTS = [
        'A+' => 4.0,
        'A' => 4.0,
        'A-' => 3.7,
        'B+' => 3.3,
        'B' => 3.0,
        'B-' => 2.7,
        'C+' => 2.3,
        'C' => 2.0,
        'C-' => 1.7,
        'D+' => 1.3,
        'D' => 1.0,
        'F' => 0.0,
        'P' => 4.0,
        'S' => 4.0,
        'U' => 0.0,
        'W' => 0.0,
    ];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function missing(User $student, Course $course): array
    {
        $course->loadMissing('prerequisites');
        $prerequisites = $course->prerequisites;

        if ($prerequisites->isEmpty()) {
            return [];
        }

        $prereqIds = $prerequisites->pluck('id')->all();

        $transcripts = Transcript::query()
            ->where('student_id', $student->id)
            ->whereIn('course_id', $prereqIds)
            ->get()
            ->groupBy('course_id');

        $completedEnrollments = SectionEnrollment::query()
            ->where('student_id', $student->id)
            ->where('status', SectionEnrollment::STATUS_COMPLETED)
            ->whereHas('section', fn ($query) => $query->whereIn('course_id', $prereqIds))
            ->with('section.course:id,code,title')
            ->get()
            ->groupBy(fn (SectionEnrollment $enrollment) => $enrollment->section?->course_id);

        $missing = [];

        foreach ($prerequisites as $prerequisite) {
            $requiredPoints = $this->requiredPoints($prerequisite->pivot?->min_grade);
            $courseId = $prerequisite->id;

            $hasTranscript = $this->transcriptSatisfies($transcripts->get($courseId), $requiredPoints);

            $hasCompletion = $completedEnrollments->has($courseId);

            if ($hasTranscript || $hasCompletion) {
                continue;
            }

            $missing[] = [
                'course_id' => $prerequisite->id,
                'course_code' => $prerequisite->code,
                'course_title' => $prerequisite->title,
                'min_grade' => $prerequisite->pivot?->min_grade,
            ];
        }

        return $missing;
    }

    public function isSatisfied(User $student, Course $course): bool
    {
        return empty($this->missing($student, $course));
    }

    /**
     * @param Collection<int, Transcript>|null $transcripts
     */
    private function transcriptSatisfies(?Collection $transcripts, float $requiredPoints): bool
    {
        if (! $transcripts || $transcripts->isEmpty()) {
            return false;
        }

        return $transcripts->contains(function (Transcript $transcript) use ($requiredPoints) {
            $points = $this->extractPoints($transcript);

            return $points !== null && $points >= $requiredPoints;
        });
    }

    private function extractPoints(Transcript $transcript): ?float
    {
        if ($transcript->grade_points !== null) {
            return (float) $transcript->grade_points;
        }

        if (! $transcript->final_grade) {
            return null;
        }

        $grade = strtoupper(trim($transcript->final_grade));

        return self::GRADE_POINTS[$grade] ?? null;
    }

    private function requiredPoints(?string $minGrade): float
    {
        if ($minGrade === null || $minGrade === '') {
            return self::DEFAULT_PASSING_POINTS;
        }

        $grade = strtoupper(trim($minGrade));

        if (isset(self::GRADE_POINTS[$grade])) {
            return self::GRADE_POINTS[$grade];
        }

        return self::DEFAULT_PASSING_POINTS;
    }
}
