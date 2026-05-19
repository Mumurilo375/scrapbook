<?php

return [
    'admin' => [
        'name' => env('ADMIN_NAME', 'Scrapbook Admin'),
        'email' => env('ADMIN_EMAIL'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'media' => [
        'disk' => env('SCRAPBOOK_MEDIA_DISK', env('FILESYSTEM_DISK', 'local')),
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/webp',
        ],
        'allowed_extensions' => [
            'jpg',
            'jpeg',
            'png',
            'webp',
        ],
        'mime_extensions' => [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'image/webp' => ['webp'],
        ],
        'max_upload_kb' => (int) env('SCRAPBOOK_MEDIA_MAX_UPLOAD_KB', 5120),
        'max_input_width' => (int) env('SCRAPBOOK_MEDIA_MAX_INPUT_WIDTH', 6000),
        'max_input_height' => (int) env('SCRAPBOOK_MEDIA_MAX_INPUT_HEIGHT', 6000),
        'processed_max_dimension' => (int) env('SCRAPBOOK_MEDIA_PROCESSED_MAX_DIMENSION', 2200),
        'thumbnail_max_dimension' => (int) env('SCRAPBOOK_MEDIA_THUMBNAIL_MAX_DIMENSION', 420),
        'webp_quality' => (int) env('SCRAPBOOK_MEDIA_WEBP_QUALITY', 82),
        'thumbnail_quality' => (int) env('SCRAPBOOK_MEDIA_THUMBNAIL_QUALITY', 72),
        'max_images_per_gift' => (int) env('SCRAPBOOK_MEDIA_MAX_IMAGES_PER_GIFT', 8),
        'max_storage_mb' => (int) env('SCRAPBOOK_MEDIA_MAX_STORAGE_MB', 50),
    ],

    'assets' => [
        'disk' => env('SCRAPBOOK_ASSET_DISK', env('FILESYSTEM_DISK', 'local')),
        'allowed_mime_types' => [
            'image/jpeg',
            'image/png',
            'image/webp',
        ],
        'allowed_extensions' => [
            'jpg',
            'jpeg',
            'png',
            'webp',
        ],
        'mime_extensions' => [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'image/webp' => ['webp'],
        ],
        'max_upload_kb' => (int) env('SCRAPBOOK_ASSET_MAX_UPLOAD_KB', 8192),
        'max_input_width' => (int) env('SCRAPBOOK_ASSET_MAX_INPUT_WIDTH', 6000),
        'max_input_height' => (int) env('SCRAPBOOK_ASSET_MAX_INPUT_HEIGHT', 6000),
    ],

    'gifts' => [
        'default_lifetime_days' => (int) env('SCRAPBOOK_GIFT_DEFAULT_LIFETIME_DAYS', 180),
    ],

    'payments' => [
        'provider' => env('SCRAPBOOK_PAYMENT_PROVIDER', 'manual_dev'),
        'dev_approval_enabled' => (bool) env('SCRAPBOOK_DEV_PAYMENT_APPROVAL', true),
    ],

    'analytics' => [
        'enabled' => (bool) env('SCRAPBOOK_ANALYTICS_ENABLED', true),
        'hash_salt' => env('SCRAPBOOK_ANALYTICS_HASH_SALT', env('APP_KEY')),
        'cookie_minutes' => (int) env('SCRAPBOOK_ANALYTICS_COOKIE_MINUTES', 60 * 24 * 365),
        'max_payload_bytes' => (int) env('SCRAPBOOK_ANALYTICS_MAX_PAYLOAD_BYTES', 8192),
        'max_payload_string_length' => (int) env('SCRAPBOOK_ANALYTICS_MAX_PAYLOAD_STRING_LENGTH', 240),
        'analytics_events_retention_days' => (int) env('SCRAPBOOK_ANALYTICS_EVENTS_RETENTION_DAYS', 395),
        'gift_visits_retention_days' => (int) env('SCRAPBOOK_GIFT_VISITS_RETENTION_DAYS', 395),
        'keep_financial_events_forever' => (bool) env('SCRAPBOOK_KEEP_FINANCIAL_EVENTS_FOREVER', true),
    ],
];
