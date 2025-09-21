<?php

namespace App\Jobs;

use App\Notifications\Enrollment\WaitlistPromotionNotification;
use App\Services\Enrollment\EnrollmentService;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class WaitlistPromoter implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;
    use Batchable;

    public function __construct(private readonly int $sectionId)
    {
        $this->onConnection('redis');
        $this->onQueue('enrollments');
    }

    public function handle(EnrollmentService $enrollmentService): void
    {
        $enrollment = $enrollmentService->promoteNextFromWaitlist($this->sectionId);

        if (! $enrollment) {
            return;
        }

        $student = $enrollment->student;

        if (! $student) {
            return;
        }

        $student->notify(new WaitlistPromotionNotification($enrollment));
    }
}
