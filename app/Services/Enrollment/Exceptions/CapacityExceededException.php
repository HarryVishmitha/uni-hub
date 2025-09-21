<?php

namespace App\Services\Enrollment\Exceptions;

class CapacityExceededException extends EnrollmentRuleException
{
    public static function sectionFull(): self
    {
        return new self('Section capacity reached.');
    }

    public static function waitlistFull(): self
    {
        return new self('Section waitlist is full.');
    }
}
