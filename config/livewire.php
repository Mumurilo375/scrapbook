<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Temporary File Uploads
    |--------------------------------------------------------------------------
    |
    | The application stores final media/assets on the configured scrapbook
    | disks, which may be S3/MinIO. Livewire's temporary upload endpoint should
    | stay local by default so the Filament picker can finish and preview files
    | even when the object storage service is offline in development.
    |
    */

    'temporary_file_upload' => [
        'disk' => env('LIVEWIRE_TEMPORARY_FILE_UPLOAD_DISK', 'local'),
        'rules' => [
            'required',
            'file',
            'mimetypes:image/png,image/jpeg,image/webp',
            'max:'.((int) env('SCRAPBOOK_ASSET_MAX_UPLOAD_KB', 8192)),
        ],
        'directory' => env('LIVEWIRE_TEMPORARY_FILE_UPLOAD_DIRECTORY', 'livewire-tmp'),
        'middleware' => env('LIVEWIRE_TEMPORARY_FILE_UPLOAD_MIDDLEWARE', 'throttle:60,1'),
        'preview_mimes' => [
            'png',
            'jpg',
            'jpeg',
            'webp',
        ],
        'max_upload_time' => (int) env('LIVEWIRE_TEMPORARY_FILE_UPLOAD_MAX_TIME', 5),
        'cleanup' => true,
    ],
];
