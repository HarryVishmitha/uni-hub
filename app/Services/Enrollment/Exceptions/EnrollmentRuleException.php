<?php

namespace App\Services\Enrollment\Exceptions;

use RuntimeException;

class EnrollmentRuleException extends RuntimeException
{
    /**
     * @param array<string, mixed> $context
     */
    public function __construct(string $message, public array $context = [], int $code = 0, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
