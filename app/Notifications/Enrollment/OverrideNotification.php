<?php

namespace App\Notifications\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class OverrideNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public string $connection = 'redis';

    public string $queue = 'notifications';

    public function __construct(private readonly SectionEnrollment $enrollment, private readonly string $action, private readonly ?string $reason = null)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->enrollment->loadMissing('section.course', 'section.term');

        $course = $this->enrollment->section?->course;
        $section = $this->enrollment->section;
        $term = $section?->term;

        $courseLabel = $course ? sprintf('%s — %s', $course->code, $course->title) : 'your course';
        $sectionLabel = $section?->section_code ? sprintf('%s (%s)', $courseLabel, $section->section_code) : $courseLabel;
        $termLabel = $term?->title ?? $term?->code;

        $message = (new MailMessage)
            ->subject('Enrollment Update')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('An administrator has '.$this->action.' your enrollment via override:')
            ->line($sectionLabel)
            ->action('View your courses', url('/account/my-courses'));

        if ($termLabel) {
            $message->line('Term: '.$termLabel);
        }

        if ($this->reason) {
            $message->line('Reason: '.$this->reason);
        }

        return $message->line('If you have questions, please contact the registrar.');
    }

    public function toArray(object $notifiable): array
    {
        $this->enrollment->loadMissing('section.course', 'section.term');

        $course = $this->enrollment->section?->course;
        $section = $this->enrollment->section;
        $term = $section?->term;

        return [
            'type' => 'override',
            'action' => $this->action,
            'section_id' => $section?->id,
            'section_code' => $section?->section_code,
            'course_id' => $course?->id,
            'course_code' => $course?->code,
            'course_title' => $course?->title,
            'term_id' => $term?->id,
            'term_label' => $term?->title ?? $term?->code,
            'reason' => $this->reason,
        ];
    }
}
