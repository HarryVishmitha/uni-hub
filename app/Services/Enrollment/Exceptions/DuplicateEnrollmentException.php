<?php

namespace App\Services\Enrollment\Exceptions;

class DuplicateEnrollmentException extends EnrollmentRuleException
{
    public static function existingActive(): self
    {
        return new self('Student is already actively enrolled in this section.');
    }

    public static function existingWaitlisted(): self
    {
        return new self('Student is already waitlisted for this section.');
    }
}
