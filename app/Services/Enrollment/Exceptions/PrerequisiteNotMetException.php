<?php

namespace App\Services\Enrollment\Exceptions;

class PrerequisiteNotMetException extends EnrollmentRuleException
{
    /**
     * @param array<int, array<string, mixed>> $missing
     */
    public static function forMissing(array $missing): self
    {
        return new self('Prerequisites not satisfied.', ['missing' => $missing]);
    }
}
