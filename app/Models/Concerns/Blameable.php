<?php

namespace App\Models\Concerns;

use Illuminate\Support\Facades\Auth;

trait Blameable
{
    protected static function bootBlameable(): void
    {
        static::creating(function ($model) {
            $userId = Auth::id();

            if (! $userId) {
                return;
            }

            if (! $model->getAttribute('created_by')) {
                $model->setAttribute('created_by', $userId);
            }

            $model->setAttribute('updated_by', $userId);
        });

        static::updating(function ($model) {
            $userId = Auth::id();

            if (! $userId) {
                return;
            }

            $model->setAttribute('updated_by', $userId);
        });
    }
}
