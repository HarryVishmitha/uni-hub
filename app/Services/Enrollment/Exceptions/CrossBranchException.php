<?php

namespace App\Services\Enrollment\Exceptions;

class CrossBranchException extends EnrollmentRuleException
{
    public static function notAllowed(): self
    {
        return new self('Cross-branch enrollment is not permitted.');
    }
}
