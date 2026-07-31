<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Scrapbook') }}</title>

        @fonts
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    <!-- impeccable-live-start -->
<script src="http://localhost:8400/live.js?token=e31e93fc-4560-4720-ae1e-e8bf7cedf66d"></script>
<!-- impeccable-live-end -->
</body>
</html>
