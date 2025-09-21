<?php

namespace App\Services\Enrollment\Exceptions;

class AddDropWindowException extends EnrollmentRuleException
{
    public static function closed(): self
    {
        return new self('Add/drop window is closed.');
    }
}
