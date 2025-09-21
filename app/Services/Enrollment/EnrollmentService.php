<?php

namespace App\Services\Enrollment;

use App\Jobs\WaitlistPromoter;
use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\Section;
use App\Models\SectionEnrollment;
use App\Models\Term;
use App\Models\User;
use App\Services\Enrollment\Exceptions\AddDropWindowException;
use App\Services\Enrollment\Exceptions\CapacityExceededException;
use App\Services\Enrollment\Exceptions\CrossBranchException;
use App\Services\Enrollment\Exceptions\DuplicateEnrollmentException;
use App\Services\Enrollment\Exceptions\PrerequisiteNotMetException;
use App\Notifications\Enrollment\OverrideNotification;
use App\Notifications\Enrollment\WaitlistPromotionNotification;
use Carbon\CarbonInterface;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Throwable;

class EnrollmentService
{
    public function __construct(
        private readonly PrerequisiteChecker $prerequisiteChecker,
        private readonly DatabaseManager $db,
    ) {
    }

    /**
     * Enroll a student into a section, handling capacity and waitlist rules.
     *
     * @param array<string, mixed> $options
     */
    public function enroll(User $actor, User $student, Section $section, string $role = SectionEnrollment::ROLE_STUDENT, array $options = []): SectionEnrollment
    {
        $override = (bool) ($options['override'] ?? false);
        $overrideReason = $options['override_reason'] ?? null;
        $bypassPrereqs = (bool) ($options['bypass_prerequisites'] ?? false);
        $forceWaitlist = (bool) ($options['force_waitlist'] ?? false);

        if (! in_array($role, SectionEnrollment::ROLES, true)) {
            throw new \InvalidArgumentException('Invalid enrollment role.');
        }

        $this->assertBranchAccess($actor, $student, $section, $override);

        return $this->db->transaction(function () use ($actor, $student, $section, $role, $override, $overrideReason, $bypassPrereqs, $forceWaitlist) {
            $existing = SectionEnrollment::query()
                ->where('student_id', $student->id)
                ->where('section_id', $section->id)
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->status === SectionEnrollment::STATUS_ACTIVE) {
                throw DuplicateEnrollmentException::existingActive();
            }

            if ($existing && $existing->status === SectionEnrollment::STATUS_WAITLISTED) {
                throw DuplicateEnrollmentException::existingWaitlisted();
            }

            $term = $section->term()->first();
            if (! $term) {
                throw new ModelNotFoundException('Section term missing.');
            }

            if (! $override && ! $this->withinAddDropWindow($term)) {
                throw AddDropWindowException::closed();
            }

            if ($role !== SectionEnrollment::ROLE_AUDITOR && ! ($override || $bypassPrereqs)) {
                $missing = $this->prerequisiteChecker->missing($student, $section->course);

                if (! empty($missing)) {
                    throw PrerequisiteNotMetException::forMissing($missing);
                }
            }

            [$status, $enrolledAt, $waitlistedAt] = $this->determineEnrollmentStatus($section, $override, $forceWaitlist);

            $payload = [
                'student_id' => $student->id,
                'section_id' => $section->id,
                'role' => $role,
                'status' => $status,
                'enrolled_at' => $enrolledAt,
                'waitlisted_at' => $waitlistedAt,
                'dropped_at' => null,
            ];

            if ($existing) {
                $existing->forceFill($payload)->save();
                $enrollment = $existing->refresh();
            } else {
                $enrollment = SectionEnrollment::create($payload);
            }

            $event = $status === SectionEnrollment::STATUS_WAITLISTED
                ? 'enrollment.waitlisted'
                : 'enrollment.created';

            $this->logEnrollmentActivity($event, $enrollment, $actor, [
                'role' => $role,
                'override' => $override,
                'override_reason' => $overrideReason,
                'status' => $status,
            ]);

            if ($override && $enrollment->student && (! $actor || $actor->id !== $student->id)) {
                $enrollment->student->notify(new OverrideNotification($enrollment, 'updated', $overrideReason));
            }

            return $enrollment;
        });
    }

    /**
     * Drop an enrollment and trigger waitlist promotion.
     *
     * @param array<string, mixed> $options
     */
    public function drop(User $actor, SectionEnrollment $enrollment, array $options = []): SectionEnrollment
    {
        if ($enrollment->status === SectionEnrollment::STATUS_DROPPED) {
            return $enrollment;
        }

        $override = (bool) ($options['override'] ?? false);
        $overrideReason = $options['override_reason'] ?? null;

        $section = $enrollment->section()->firstOrFail();
        $term = $section->term()->first();

        if ($term && ! $override && ! $this->withinAddDropWindow($term)) {
            throw AddDropWindowException::closed();
        }

        $this->assertBranchAccess($actor, $enrollment->student()->firstOrFail(), $section, $override);

        $result = $this->db->transaction(function () use ($actor, $enrollment, $override, $overrideReason) {
            $enrollment->forceFill([
                'status' => SectionEnrollment::STATUS_DROPPED,
                'dropped_at' => now(),
            ])->save();

            $this->logEnrollmentActivity('enrollment.dropped', $enrollment->refresh(), $actor, [
                'override' => $override,
                'override_reason' => $overrideReason,
            ]);

            return $enrollment;
        });

        $sectionId = $enrollment->section_id;

        $this->dispatchWaitlistPromotion($sectionId);

        if ($override && $result->student && (! $actor || $actor->id !== $result->student->id)) {
            $result->student->notify(new OverrideNotification($result, 'updated', $overrideReason));
        }

        return $result;
    }

    /**
     * Promote earliest waitlisted student if capacity permits.
     */
    public function promoteNextFromWaitlist(int $sectionId, ?User $actor = null): ?SectionEnrollment
    {
        return $this->db->transaction(function () use ($sectionId, $actor) {
            $section = Section::query()->lockForUpdate()->find($sectionId);

            if (! $section) {
                return null;
            }

            $activeCount = SectionEnrollment::query()
                ->where('section_id', $section->id)
                ->where('status', SectionEnrollment::STATUS_ACTIVE)
                ->lockForUpdate()
                ->count();

            if ($activeCount >= $section->capacity) {
                return null;
            }

            $waitlisted = SectionEnrollment::query()
                ->where('section_id', $section->id)
                ->where('status', SectionEnrollment::STATUS_WAITLISTED)
                ->orderByRaw('COALESCE(waitlisted_at, created_at) asc')
                ->lockForUpdate()
                ->first();

            if (! $waitlisted) {
                return null;
            }

            $waitlisted->forceFill([
                'status' => SectionEnrollment::STATUS_ACTIVE,
                'enrolled_at' => now(),
                'waitlisted_at' => null,
                'dropped_at' => null,
            ])->save();

            $this->logEnrollmentActivity('enrollment.promoted', $waitlisted->refresh(), $actor, []);

            return $waitlisted;
        });
    }

    /**
     * Batch enroll students via program cohort filters.
     *
     * @param array<string, mixed> $filters
     * @return array{enrolled: int, waitlisted: int, failures: array<int, array<string, mixed>>}
     */
    public function batchEnroll(User $actor, Program $program, Term $term, Section $section, array $filters = [], array $options = []): array
    {
        $cohort = $filters['cohort'] ?? null;

        if ($section->term_id !== $term->id) {
            throw new \InvalidArgumentException('Section does not belong to the provided term.');
        }

        if ($program->branch_id && $section->branch_id && (int) $program->branch_id !== (int) $section->branch_id) {
            throw new \InvalidArgumentException('Program and section must belong to the same branch for batch enrollment.');
        }

        $query = ProgramEnrollment::query()
            ->where('program_id', $program->id)
            ->where('status', ProgramEnrollment::STATUS_ACTIVE)
            ->when($cohort, fn (Builder $builder) => $builder->where('cohort', $cohort))
            ->with('student');

        $programEnrollments = $query->get();

        $enrolled = 0;
        $waitlisted = 0;
        $failures = [];

        foreach ($programEnrollments as $programEnrollment) {
            $student = $programEnrollment->student;

            if (! $student) {
                continue;
            }

            try {
                $result = $this->enroll($actor, $student, $section, SectionEnrollment::ROLE_STUDENT, $options);
                if ($result->status === SectionEnrollment::STATUS_ACTIVE) {
                    $enrolled++;
                } elseif ($result->status === SectionEnrollment::STATUS_WAITLISTED) {
                    $waitlisted++;
                }
            } catch (Throwable $e) {
                $failures[] = [
                    'student_id' => $student->id,
                    'student_name' => $student->name,
                    'message' => $e->getMessage(),
                ];
            }
        }

        return compact('enrolled', 'waitlisted', 'failures');
    }

    private function withinAddDropWindow(Term $term): bool
    {
        $start = $term->add_drop_start;
        $end = $term->add_drop_end;
        $today = now()->startOfDay();

        if ($start && $today->lt($start)) {
            return false;
        }

        if ($end && $today->gt($end)) {
            return false;
        }

        return true;
    }

    private function assertBranchAccess(User $actor, User $student, Section $section, bool $override): void
    {
        if ($actor->isSuperAdmin() || $override) {
            return;
        }

        $branchId = $section->branch_id;

        if ($branchId && $actor->branch_id && (int) $actor->branch_id !== (int) $branchId) {
            throw CrossBranchException::notAllowed();
        }

        if ($branchId && $student->branch_id && (int) $student->branch_id !== (int) $branchId) {
            throw CrossBranchException::notAllowed();
        }
    }

    /**
     * @return array{0: string, 1: ?CarbonInterface, 2: ?CarbonInterface}
     */
    private function determineEnrollmentStatus(Section $section, bool $override, bool $forceWaitlist): array
    {
        $activeCount = SectionEnrollment::query()
            ->where('section_id', $section->id)
            ->where('status', SectionEnrollment::STATUS_ACTIVE)
            ->lockForUpdate()
            ->count();

        $waitlistedCount = SectionEnrollment::query()
            ->where('section_id', $section->id)
            ->where('status', SectionEnrollment::STATUS_WAITLISTED)
            ->lockForUpdate()
            ->count();

        $now = now();

        if ($forceWaitlist && $section->waitlist_cap > $waitlistedCount) {
            return [SectionEnrollment::STATUS_WAITLISTED, null, $now];
        }

        if ($activeCount < $section->capacity || $override) {
            return [SectionEnrollment::STATUS_ACTIVE, $now, null];
        }

        if ($section->waitlist_cap <= 0) {
            throw CapacityExceededException::sectionFull();
        }

        if ($waitlistedCount >= $section->waitlist_cap) {
            throw CapacityExceededException::waitlistFull();
        }

        return [SectionEnrollment::STATUS_WAITLISTED, null, $now];
    }

    private function logEnrollmentActivity(string $event, SectionEnrollment $enrollment, ?User $actor, array $properties = []): void
    {
        if (! function_exists('activity')) {
            return;
        }

        DB::afterCommit(function () use ($event, $enrollment, $actor, $properties) {
            \activity('enrollment')
                ->performedOn($enrollment)
                ->causedBy($actor)
                ->event($event)
                ->withProperties(array_merge($properties, [
                    'branch_id' => $enrollment->branch_id,
                    'section_id' => $enrollment->section_id,
                    'student_id' => $enrollment->student_id,
                    'status' => $enrollment->status,
                    'role' => $enrollment->role,
                ]))
                ->log($event);
        });
    }

    private function dispatchWaitlistPromotion(int $sectionId): void
    {
        DB::afterCommit(function () use ($sectionId) {
            WaitlistPromoter::dispatch($sectionId);
        });
    }
}
