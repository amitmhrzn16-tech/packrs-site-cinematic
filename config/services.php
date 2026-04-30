<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Marketing Leads CRM
    |--------------------------------------------------------------------------
    |
    | Where to forward each new pickup booking so it shows up alongside
    | Meta/TikTok/Google ad leads. The dispatcher signs every payload with
    | HMAC-SHA256 using `webhook_secret`. Leave `webhook_url` empty to disable.
    |
    */

    'marketing' => [
        'webhook_url'    => env('MARKETING_LEADS_WEBHOOK_URL'),
        'webhook_secret' => env('MARKETING_LEADS_WEBHOOK_SECRET'),
        'timeout'        => (int) env('MARKETING_LEADS_TIMEOUT', 4),
    ],

];
