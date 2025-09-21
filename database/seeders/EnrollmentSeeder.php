<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\ProgramEnrollment;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Transcript;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use function fake;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $branches = Branch::with(['programs', 'terms', 'orgUnits'])->get();

        if ($branches->isEmpty()) {
            return;
        }

        $branches->each(function (Branch $branch) {
            $students = User::factory()
                ->count(fake()->numberBetween(50, 80))
                ->create(['branch_id' => $branch->id])
                ->each(fn (User $student) => $student->assignRole('student'));

            $programs = $branch->programs;
            $terms = $branch->terms;
            $sections = Section::query()
                ->whereHas('course.orgUnit', fn ($q) => $q->where('branch_id', $branch->id))
                ->with(['term', 'course'])
                ->get();

            if ($programs->isEmpty() || $sections->isEmpty()) {
                return;
            }

            // Program enrollments per cohort
            $students->chunk(10)->each(function (Collection $chunk) use ($programs, $terms) {
                $program = $programs->random();
                $startTerm = $terms->isNotEmpty() ? $terms->random() : null;
                $cohort = strtoupper(Arr::random(['Alpha', 'Beta', 'Gamma', 'Delta'])).' '.fake()->numberBetween(2024, 2027);

                $chunk->each(function (User $student) use ($program, $startTerm, $cohort) {
                    ProgramEnrollment::factory()->create([
                        'student_id' => $student->id,
                        'program_id' => $program->id,
                        'cohort' => $cohort,
                        'status' => ProgramEnrollment::STATUS_ACTIVE,
                        'start_term_id' => $startTerm?->id,
                    ]);
                });
            });

            // Section enrollments with waitlist scenarios
            $sections->each(function (Section $section) use ($students) {
                $capacity = max(5, $section->capacity ?? 20);
                $activeCount = fake()->numberBetween((int) ($capacity * 0.4), $capacity);
                $waitlistCount = fake()->boolean(40) ? fake()->numberBetween(0, max(1, $section->waitlist_cap ?? 5)) : 0;

                $chosen = $students->random(min($students->count(), $activeCount + $waitlistCount));

                $chosen->values()->each(function (User $student, $index) use ($section, $activeCount) {
                    $status = $index < $activeCount
                        ? SectionEnrollment::STATUS_ACTIVE
                        : SectionEnrollment::STATUS_WAITLISTED;

                    SectionEnrollment::factory()->create([
                        'section_id' => $section->id,
                        'student_id' => $student->id,
                        'status' => $status,
                        'role' => SectionEnrollment::ROLE_STUDENT,
                        'enrolled_at' => $status === SectionEnrollment::STATUS_ACTIVE ? now()->subDays(fake()->numberBetween(1, 30)) : null,
                        'waitlisted_at' => $status === SectionEnrollment::STATUS_WAITLISTED ? now()->subDays(fake()->numberBetween(1, 15)) : null,
                    ]);
                });
            });

            // Generate transcripts for completed enrollments
            SectionEnrollment::query()
                ->whereIn('section_id', $sections->pluck('id'))
                ->where('status', SectionEnrollment::STATUS_ACTIVE)
                ->inRandomOrder()
                ->limit(100)
                ->get()
                ->each(function (SectionEnrollment $enrollment) {
                    Transcript::factory()->create([
                        'student_id' => $enrollment->student_id,
                        'course_id' => $enrollment->section?->course_id,
                        'term_id' => $enrollment->section?->term_id,
                        'final_grade' => Arr::random(['A', 'B', 'C', 'P']),
                        'grade_points' => Arr::random([4.0, 3.7, 3.0, 2.7, 2.0, 0.0]),
                    ]);
                });
        });
    }
}
