<?php

namespace App\Notifications\Enrollment;

use App\Models\SectionEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WaitlistPromotionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly SectionEnrollment $enrollment)
    {
        $this->onQueue('notifications');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function viaQueues(): array
    {
        return [
            'mail' => 'notifications',
            'database' => 'notifications',
        ];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $this->enrollment->loadMissing('section.course', 'section.term');

        $section = $this->enrollment->section;
        $course = $section?->course;
        $term = $section?->term;

        $courseLabel = $course ? sprintf('%s — %s', $course->code, $course->title) : 'your course';
        $sectionLabel = $section?->section_code ? sprintf('%s (%s)', $courseLabel, $section->section_code) : $courseLabel;
        $termLabel = $term?->title ?? $term?->code;

        $mail = (new MailMessage)
            ->subject('Seat Available: You are now enrolled')
            ->greeting('Good news!')
            ->line("A seat has opened up and you have been promoted from the waitlist")
            ->line($sectionLabel)
            ->action('View your courses', url('/account/my-courses'))
            ->line('See you in class!');

        if ($termLabel) {
            $mail->line("Term: {$termLabel}");
        }

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->enrollment->loadMissing('section.course', 'section.term');

        $section = $this->enrollment->section;
        $course = $section?->course;
        $term = $section?->term;

        return [
            'type' => 'waitlist_promotion',
            'section_id' => $section?->id,
            'course_id' => $course?->id,
            'course_code' => $course?->code,
            'course_title' => $course?->title,
            'term_id' => $term?->id,
            'term_label' => $term?->title ?? $term?->code,
        ];
    }
}
