<?php

namespace App\Enums;

enum ScopeMode: string
{
    case SELF = 'self';
    case SUBTREE = 'subtree';
    case GLOBAL = 'global';

    public function includesDescendants(): bool
    {
        return $this === self::SUBTREE || $this === self::GLOBAL;
    }

    public function isGlobal(): bool
    {
        return $this === self::GLOBAL;
    }
}
