<?php

namespace App\Support;

class Flash
{
    /**
     * Add a success flash message to the session.
     *
     * @param string $message
     * @return void
     */
    public static function success(string $message): void
    {
        session()->flash('alert', [
            'type' => 'success',
            'message' => $message,
        ]);
    }

    /**
     * Add an error flash message to the session.
     *
     * @param string $message
     * @return void
     */
    public static function error(string $message): void
    {
        session()->flash('alert', [
            'type' => 'error',
            'message' => $message,
        ]);
    }

    /**
     * Add a warning flash message to the session.
     *
     * @param string $message
     * @return void
     */
    public static function warning(string $message): void
    {
        session()->flash('alert', [
            'type' => 'warning',
            'message' => $message,
        ]);
    }

    /**
     * Add an info flash message to the session.
     *
     * @param string $message
     * @return void
     */
    public static function info(string $message): void
    {
        session()->flash('alert', [
            'type' => 'info',
            'message' => $message,
        ]);
    }
}