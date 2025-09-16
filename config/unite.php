<?php

return [
    'enforce' => env('UNITE_ENFORCE', false),
    'log_observations' => env('UNITE_LOG_OBSERVATIONS', true),

    'cache' => [
        'prefix' => env('UNITE_CACHE_PREFIX', 'unite'),
        'ttl' => env('UNITE_CACHE_TTL', 3600),
        'version_key' => env('UNITE_CACHE_VERSION_KEY', 'unite_cache_version'),
    ],
];
