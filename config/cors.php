<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_filter(array_unique([
        env('FRONTEND_URL', env('APP_URL', 'http://127.0.0.1:8000')),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ])),
    'allowed_origins_patterns' => [
        '#^http://(localhost|127\.0\.0\.1):\d+$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
